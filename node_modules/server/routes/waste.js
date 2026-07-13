const express = require('express');
const WasteLog = require('../models/WasteLog');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// Log a waste entry
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'CASHIER'), async (req, res) => {
  try {
    const { itemName, quantity, reason } = req.body;
    const entry = await WasteLog.create({
      itemName, quantity, reason,
      loggedBy: req.user.id,
      branchId: req.user.branchId
    });

    await logAction({
      action: 'WASTE_LOGGED',
      user: req.user,
      branchId: req.user.branchId,
      details: { itemName, quantity, reason }
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get waste index (total waste entries for branch)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const logs = await WasteLog.find({ branchId: req.user.branchId }).sort({ createdAt: -1 });
    const totalQuantity = logs.reduce((sum, l) => sum + l.quantity, 0);
    res.json({ logs, totalQuantity, wasteIndex: logs.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;