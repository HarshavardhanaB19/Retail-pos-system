const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET all categories for branch
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ branchId: req.user.branchId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new category
router.post('/', async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      branchId: req.user.branchId
    });
    await newCategory.save();
    res.json(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findOneAndDelete({ _id: req.params.id, branchId: req.user.branchId });
    if (!cat) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
