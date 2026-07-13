const express = require('express');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// GET all products for the logged-in user's branch
router.get('/', authenticate, async (req, res) => {
  try {
    const products = await Product.find({ branchId: req.user.branchId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a product (SUPER_ADMIN or ADMIN only)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, price, stock, reorderLevel, translations } = req.body;
    const product = await Product.create({
      name,
      price,
      stock,
      reorderLevel,
      translations: translations || {},
      branchId: req.user.branchId
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE a product (SUPER_ADMIN or ADMIN only)
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await logAction({
  action: 'PRODUCT_CREATE',
  user: req.user,
  branchId: req.user.branchId,
  details: { productName: product.name, price: product.price, stock: product.stock }
});
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a product (SUPER_ADMIN or ADMIN only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;