const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'PRODUCT_CREATE', 'ORDER_CONFIRM'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: String,
  role: String,
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);