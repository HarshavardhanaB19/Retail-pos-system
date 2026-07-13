const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true }, // e.g. 'expired', 'voided', 'plate-waste'
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true }
}, { timestamps: true });

module.exports = mongoose.model('WasteLog', wasteLogSchema);