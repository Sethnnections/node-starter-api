const User = require('../models/User.model');
const ApiError = require('../utils/apiError');
const ActionTrail = require('../models/ActionTrail.model');
const { filterObject } = require('../utils/helpers');

const getCurrentUser = async (userId) => {
  return await User.findById(userId);
};

const updateProfile = async (userId, updateData) => {
  const filteredData = filterObject(updateData, 'firstName', 'lastName', 'email');
  
  if (filteredData.email) {
    const existingUser = await User.findOne({ email: filteredData.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new ApiError.badRequest('Email already in use');
    }
  }

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true
  });

  await ActionTrail.create({
    user: userId,
    action: 'profile_update',
    status: 'success',
    metadata: { updatedFields: Object.keys(filteredData) }
  });

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!(await user.correctPassword(currentPassword, user.password))) {
    await ActionTrail.create({
      user: userId,
      action: 'password_change',
      status: 'failed',
      metadata: { reason: 'Incorrect current password' }
    });
    throw new ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  await ActionTrail.create({
    user: userId,
    action: 'password_change',
    status: 'success'
  });
};

module.exports = {
  getCurrentUser,
  updateProfile,
  changePassword
};