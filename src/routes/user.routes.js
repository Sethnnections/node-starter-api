const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validation.middleware');
const userValidation = require('../validations/user.validation');

router.use(authMiddleware.protect);

router.get('/me', userController.getProfile);
router.patch('/update-profile', validate(userValidation.updateProfile), userController.updateProfile);
router.patch('/change-password', validate(userValidation.changePassword), userController.changePassword);

module.exports = router;