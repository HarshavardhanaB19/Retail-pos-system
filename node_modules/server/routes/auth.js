const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.get('/admin-only', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), authController.getAdminOnly);

// Users management (Admin/SuperAdmin)
router.get('/users', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), authController.getUsers);
router.post('/users', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), authController.createUser);
router.put('/users/:id/ingredients-access', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), authController.updateIngredientsAccess);
router.put('/users/:id/reset-password', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), authController.resetPassword);

module.exports = router;
