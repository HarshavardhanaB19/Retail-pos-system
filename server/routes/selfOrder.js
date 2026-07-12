const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');
const eventBus = require('../utils/eventBus');
const { sendOrderNotification } = require('../utils/notify');

const router = express.Router();

// Generate a short-lived QR/table session token (staff would normally trigger this per table)
router.get('/session/:branchId/:tableId', (req, res) => {
  const { branchId, tableId } = req.params;
  const token = jwt.sign(
    { branchId, tableId },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.json({ token });
});

// Middleware: verify a customer session token
function verifySession(req, res, next) {
  const token = req.headers['x-session-token'];
  if (!token) return res.status(401).json({ message: 'No session token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.session = decoded; // { branchId, tableId }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

// Public menu for a branch (no login)
router.get('/menu', verifySession, async (req, res) => {
  try {
    const products = await Product.find({ branchId: req.session.branchId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer submits an order — lands as PENDING_CONFIRMATION, no stock touched yet
router.post('/order', verifySession, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: 'Product not found' });
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      items: orderItems,
      subtotal,
      total: subtotal,
      status: 'PENDING_CONFIRMATION',
      source: 'SELF_SERVICE',
      branchId: req.session.branchId
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer checks their own order status
router.get('/order/:orderId', verifySession, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, branchId: req.session.branchId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// STAFF: view pending confirmation queue
router.get('/queue', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'CASHIER'), async (req, res) => {
  try {
    const orders = await Order.find({
      branchId: req.user.branchId,
      status: 'PENDING_CONFIRMATION'
    }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// STAFF: confirm an order — THIS decrements stock
router.post('/queue/:orderId/confirm', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'CASHIER'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'PENDING_CONFIRMATION') {
      return res.status(400).json({ message: 'Order already processed' });
    }

    // Decrement stock now
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    order.status = 'PAID';
    await order.save();
    eventBus.emit('order.confirmed', { orderId: order._id, total: order.total });
    sendOrderNotification(order.customerPhone, `Your order is confirmed! Total: ₹${order.total}`);
    await logAction({
  action: 'ORDER_CONFIRM',
  user: req.user,
  branchId: req.user.branchId,
  details: { orderId: order._id, total: order.total }
});

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// STAFF: reject an order
router.post('/queue/:orderId/reject', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'CASHIER'), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: 'Order rejected', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Public: get queue depth + branch environment type for ETA display
router.get('/branch-status/:branchId', async (req, res) => {
  try {
    const Branch = require('../models/Branch');
    const branch = await Branch.findById(req.params.branchId);
    const queueDepth = await Order.countDocuments({
      branchId: req.params.branchId,
      status: 'PENDING_CONFIRMATION'
    });

    res.json({
      environmentType: branch?.environmentType || 'STANDARD',
      queueDepth,
      estimatedWaitMinutes: queueDepth * 5 // simple heuristic: 5 min per queued order
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;