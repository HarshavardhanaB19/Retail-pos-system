const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  environmentType: {
    type: String,
    enum: ['STANDARD', 'METRO', 'HILL_STATION', 'DESERT'],
    default: 'STANDARD'
  },
  envSurchargeRate: { type: Number, default: 0 } // percentage, e.g. 5 = 5%
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);