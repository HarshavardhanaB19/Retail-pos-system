const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/low-stock', async (req, res) => {
  try {
    const products = await Product.find({ 
      branchId: req.user.branchId,
      $expr: { $lte: ['$stock', '$reorderLevel'] }
    });
    const ingredients = await Ingredient.find({
      branchId: req.user.branchId,
      $expr: { $lte: ['$stock', '$reorderLevel'] }
    });
    res.json({ products, ingredients });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
