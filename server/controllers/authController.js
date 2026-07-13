const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAction } = require('../utils/audit');

const login = async (req, res, next) => {
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
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ message: 'Logged out' });
};

const getMe = (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
};

const getAdminOnly = (req, res) => {
  res.json({ message: 'Welcome, admin. This route is protected.' });
};

const updateIngredientsAccess = async (req, res, next) => {
  try {
    const { hasIngredientsAccess } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hasIngredientsAccess },
      { new: true }
    );

    await logAction({
      action: 'INGREDIENTS_ACCESS_CHANGE',
      user: req.user,
      branchId: req.user.branchId,
      details: { targetUser: user.name, granted: hasIngredientsAccess }
    });

    res.json({ message: 'Updated', user: { id: user._id, name: user.name, hasIngredientsAccess: user.hasIngredientsAccess } });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ branchId: req.user.branchId }).select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
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

    await logAction({
      action: 'USER_CREATE',
      user: req.user,
      branchId: req.user.branchId,
      details: { newUserEmail: email, role }
    });

    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true });

    await logAction({
      action: 'PASSWORD_RESET',
      user: req.user,
      branchId: req.user.branchId,
      details: { targetUser: user.name }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  logout,
  getMe,
  getAdminOnly,
  updateIngredientsAccess,
  getUsers,
  createUser,
  resetPassword
};
