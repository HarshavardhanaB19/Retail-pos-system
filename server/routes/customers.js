const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ branchId: req.user.branchId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCustomer = new Customer({
      ...req.body,
      branchId: req.user.branchId
    });
    await newCustomer.save();
    res.json(newCustomer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cust = await Customer.findOneAndDelete({ _id: req.params.id, branchId: req.user.branchId });
    if (!cust) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
