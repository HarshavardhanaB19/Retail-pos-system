const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');

const router = express.Router();

const PARTNER_SECRET = 'demo_partner_secret_123'; // in production, per-partner secrets stored securely

// Signed webhook endpoint — simulates Swiggy/Zomato-style order ingestion
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', PARTNER_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { items, branchId } = req.body;
    let subtotal = 0;
    const orderItems = items.map(item => {
      subtotal += item.price * item.quantity;
      return item;
    });

    const order = await Order.create({
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'PENDING_CONFIRMATION', // per A12: never auto-confirmed
      source: 'AGGREGATOR',
      branchId
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;