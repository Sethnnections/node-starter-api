const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const adminController = require('../controllers/admin.controller');
const validate = require('../middlewares/validation.middleware');
const adminValidation = require('../validations/admin.validation');

router.use(authMiddleware.protect, roleMiddleware('admin'));

router.get('/users', validate(adminValidation.getUsers), adminController.getAllUsers);
router.get('/users/:userId', adminController.getUser);
router.patch('/users/:userId', validate(adminValidation.updateUser), adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;