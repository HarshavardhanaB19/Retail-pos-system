const express = require('express');
const Branch = require('../models/Branch');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// Get current branch details
router.get('/me', authenticate, async (req, res) => {
  try {
    const branch = await Branch.findById(req.user.branchId);
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update environment type + surcharge (Admin/SuperAdmin only, own branch)
router.put('/me', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { environmentType, envSurchargeRate } = req.body;
    const branch = await Branch.findByIdAndUpdate(
      req.user.branchId,
      { environmentType, envSurchargeRate },
      { new: true }
    );

    await logAction({
      action: 'BRANCH_ENV_UPDATE',
      user: req.user,
      branchId: req.user.branchId,
      details: { environmentType, envSurchargeRate }
    });

    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;