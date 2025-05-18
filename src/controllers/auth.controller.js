const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(
      req.body,
      req.ip,
      req.get('User-Agent')
    );
    ApiResponse.created(res, user, 'Registration successful. Please check your email for verification.');
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.query.token);
    ApiResponse.success(res, null, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(
      email,
      password,
      req.ip,
      req.get('User-Agent')
    );

    // Set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    ApiResponse.success(res, { user, tokens }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    ApiResponse.success(res, null, 'Password reset email sent if account exists');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.query.token, req.body.password);
    ApiResponse.success(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
};