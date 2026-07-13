const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ branchId: req.user.branchId });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newSupplier = new Supplier({
      ...req.body,
      branchId: req.user.branchId
    });
    await newSupplier.save();
    res.json(newSupplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supp = await Supplier.findOneAndDelete({ _id: req.params.id, branchId: req.user.branchId });
    if (!supp) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
