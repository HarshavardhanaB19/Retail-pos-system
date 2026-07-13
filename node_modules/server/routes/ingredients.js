const express = require('express');
const Ingredient = require('../models/Ingredient');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/audit');

const router = express.Router();

// Middleware: allow SUPER_ADMIN/ADMIN always, or CASHIER only if hasIngredientsAccess
function ingredientsAccess(req, res, next) {
  const { role, hasIngredientsAccess } = req.user;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return next();
  if (role === 'CASHIER' && hasIngredientsAccess) return next();
  return res.status(403).json({ message: 'Forbidden: no ingredients access' });
}

// GET all ingredients for the branch
router.get('/', authenticate, ingredientsAccess, async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ branchId: req.user.branchId });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE an ingredient
router.post('/', authenticate, ingredientsAccess, async (req, res) => {
  try {
    const { name, quantity, unit, isUtilityType, criticalThreshold } = req.body;
    const ingredient = await Ingredient.create({
      name, quantity, unit,
      isUtilityType: isUtilityType || false,
      criticalThreshold: criticalThreshold || 10,
      branchId: req.user.branchId
    });

    await logAction({
      action: 'INGREDIENT_CREATE',
      user: req.user,
      branchId: req.user.branchId,
      details: { name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit }
    });

    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE (restock) an ingredient
router.put('/:id', authenticate, ingredientsAccess, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await logAction({
      action: 'INGREDIENT_RESTOCK',
      user: req.user,
      branchId: req.user.branchId,
      details: { name: ingredient.name, newQuantity: ingredient.quantity }
    });

    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an ingredient
router.delete('/:id', authenticate, ingredientsAccess, async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Critical utility alerts (for DESERT branches)
router.get('/critical-alerts', authenticate, ingredientsAccess, async (req, res) => {
  try {
    const critical = await Ingredient.find({
      branchId: req.user.branchId,
      isUtilityType: true,
      $expr: { $lte: ['$quantity', '$criticalThreshold'] }
    });
    res.json(critical);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;