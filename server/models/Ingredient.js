const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  isUtilityType: { type: Boolean, default: false }, // true for water/fuel-style tracking
  criticalThreshold: { type: Number, default: 10 }, // triggers high-priority alert
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);