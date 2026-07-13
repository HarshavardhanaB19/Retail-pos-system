const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will store hashed password
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'CASHIER'],
    required: true
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  hasIngredientsAccess: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);