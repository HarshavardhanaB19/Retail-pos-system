const { authenticate, authorize } = require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logged out' });
});
// Test protected route
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

router.get('/admin-only', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  res.json({ message: 'Welcome, admin. This route is protected.' });
});
// Admin grants/revokes a cashier's ingredients access
router.put('/users/:id/ingredients-access', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { hasIngredientsAccess } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hasIngredientsAccess },
      { new: true }
    );

    const { logAction } = require('../utils/audit');
    await logAction({
      action: 'INGREDIENTS_ACCESS_CHANGE',
      user: req.user,
      branchId: req.user.branchId,
      details: { targetUser: user.name, granted: hasIngredientsAccess }
    });

    res.json({ message: 'Updated', user: { id: user._id, name: user.name, hasIngredientsAccess: user.hasIngredientsAccess } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// List users in the branch (Admin/SuperAdmin only)
router.get('/users', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const users = await User.find({ branchId: req.user.branchId }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Admin creates a new staff user
router.post('/users', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only SuperAdmin can create SuperAdmin accounts' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashedPassword, role,
      branchId: req.user.branchId
    });

    const { logAction } = require('../utils/audit');
    await logAction({
      action: 'USER_CREATE',
      user: req.user,
      branchId: req.user.branchId,
      details: { newUserEmail: email, role }
    });

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin resets a user's password
router.put('/users/:id/reset-password', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true });

    const { logAction } = require('../utils/audit');
    await logAction({
      action: 'PASSWORD_RESET',
      user: req.user,
      branchId: req.user.branchId,
      details: { targetUser: user.name }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
