const User = require('../models/User.model');
const ApiError = require('../utils/apiError');
const ActionTrail = require('../models/ActionTrail.model');
const { paginate } = require('../utils/helpers');

const getAllUsers = async (filter = {}, options = {}) => {
  const users = await paginate(
    User.find(filter),
    options.page,
    options.limit
  ).select('-password');

  return users;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError.notFound('User not found');
  }
  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    throw new ApiError.notFound('User not found');
  }

  await ActionTrail.create({
    user: userId,
    action: 'admin_update',
    status: 'success',
    metadata: { updatedBy: userId, changes: updateData }
  });

  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError.notFound('User not found');
  }

  await ActionTrail.create({
    user: userId,
    action: 'account_deletion',
    status: 'success',
    metadata: { deletedBy: userId }
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};