const AuditLog = require('../models/AuditLog');

async function logAction({ action, user, branchId, details }) {
  try {
    await AuditLog.create({
      action,
      performedBy: user?.id,
      performedByName: user?.name || 'System',
      role: user?.role,
      branchId,
      details
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = { logAction };