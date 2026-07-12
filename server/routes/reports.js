const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard summary: today's sales, order count, top items, low stock, channel split
router.get('/summary', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const branchId = req.user.branchId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysOrders = await Order.find({
      branchId,
      status: 'PAID',
      createdAt: { $gte: startOfDay }
    });

    const totalSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = todaysOrders.length;

    // Channel split
    const channelSplit = { CASHIER: 0, SELF_SERVICE: 0, AGGREGATOR: 0 };
    todaysOrders.forEach(o => { channelSplit[o.source] = (channelSplit[o.source] || 0) + 1; });

    // Top items
    const itemCounts = {};
    todaysOrders.forEach(o => {
      o.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    // Low stock
    const allProducts = await Product.find({ branchId });
    const lowStock = allProducts.filter(p => p.stock <= p.reorderLevel);

    res.json({
      totalSales,
      orderCount,
      channelSplit,
      topItems,
      lowStock: lowStock.map(p => ({ name: p.name, stock: p.stock, reorderLevel: p.reorderLevel }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Audit log (SUPER_ADMIN only, per PRD RBAC matrix)
router.get('/audit-log', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;