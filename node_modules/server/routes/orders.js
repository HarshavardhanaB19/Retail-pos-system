const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Branch = require('../models/Branch');
const { authenticate, authorize } = require('../middleware/auth');
const eventBus = require('../utils/eventBus');

const router = express.Router();

// CREATE an order (cashier billing flow)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'CASHIER'), async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let subtotal = 0;
    const orderItems = [];

    // First pass: check stock is sufficient for everything
    const products = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      products.push({ product, quantity: item.quantity });
    }

    // Second pass: deduct stock and build order items
    for (const { product, quantity } of products) {
      product.stock -= quantity;
      await product.save();

      const lineTotal = product.price * quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
    }

    const branch = await Branch.findById(req.user.branchId);
    const surchargeRate = branch?.envSurchargeRate || 0;
    const surchargeAmount = Math.round((subtotal * surchargeRate) / 100);
    const total = subtotal + surchargeAmount;

    const order = await Order.create({
      items: orderItems,
      subtotal,
      total,
      surchargeRate,
      surchargeAmount,
      status: 'PAID',
      source: 'CASHIER',
      branchId: req.user.branchId,
      createdBy: req.user.id
    });

    eventBus.emit('order.created', { orderId: order._id, total: order.total, source: 'CASHIER' });
    eventBus.emit('payment.recorded', { orderId: order._id, amount: order.total });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all orders for the branch
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ branchId: req.user.branchId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;