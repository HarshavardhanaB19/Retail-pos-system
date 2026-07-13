const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // default/English name
  translations: {
    type: Map,
    of: String,
    default: {}
  }, // e.g. { hi: 'मसाला डोसा', kn: 'ಮಸಾಲಾ ದೋಸೆ' }
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);