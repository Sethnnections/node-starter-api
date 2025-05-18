const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/apiResponse');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers(req.query);
    ApiResponse.success(res, users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.userId);
    ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await adminService.updateUser(req.params.userId, req.body);
    ApiResponse.success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.userId);
    ApiResponse.success(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
};