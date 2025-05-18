const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const ApiError = require('../utils/apiError');
const { generateAuthTokens } = require('../utils/tokenUtils');
const ActionTrail = require('../models/ActionTrail.model');
const emailService = require('./email.service');
const TokenService = require('./token.service');



const register = async (userData, ip, userAgent) => {
    // Check if email exists
    if (await User.findOne({ email: userData.email })) {
        throw new ApiError.badRequest('Email already in use');
    }

    // Create user
    const user = await User.create(userData);
    // Replace manual token generation with:
    const verificationToken = TokenService.generateRandomToken();
    user.emailVerificationToken = TokenService.hashToken(verificationToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Log action
    await ActionTrail.create({
        user: user._id,
        action: 'register',
        ipAddress: ip,
        userAgent,
        status: 'success'
    });

  return user;
};

const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError.badRequest('Invalid or expired token');
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  await ActionTrail.create({
    user: user._id,
    action: 'email_verification',
    status: 'success'
  });

  return user;
};

const login = async (email, password, ip, userAgent) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    await ActionTrail.create({
      user: user?._id,
      action: 'login',
      ipAddress: ip,
      userAgent,
      status: 'failed',
      metadata: { reason: 'Invalid credentials' }
    });
    throw new ApiError.unauthorized('Incorrect email or password');
  }

  if (!user.emailVerified) {
    throw new ApiError.forbidden('Please verify your email first');
  }

  if (!user.active) {
    throw new ApiError.forbidden('Account deactivated');
  }

    const tokens = TokenService.generateAuthTokens(user);

  await ActionTrail.create({
    user: user._id,
    action: 'login',
    ipAddress: ip,
    userAgent,
    status: 'success'
  });

  return { user, tokens };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user doesn't exist
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  await emailService.sendPasswordResetEmail(user.email, resetToken);

  await ActionTrail.create({
    user: user._id,
    action: 'password_reset_request',
    status: 'success'
  });
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError.badRequest('Invalid or expired token');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await ActionTrail.create({
    user: user._id,
    action: 'password_reset',
    status: 'success'
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
};