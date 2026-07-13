const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/error');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const selfOrderRoutes = require('./routes/selfOrder');
const reportRoutes = require('./routes/reports');
const ingredientRoutes = require('./routes/ingredients');
const branchRoutes = require('./routes/branches');
const wasteRoutes = require('./routes/waste');
const aggregatorRoutes = require('./routes/aggregator');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const customerRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const auditRoutes = require('./routes/audit');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://harshavardhanab19.github.io'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/self-order', selfOrderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/aggregator', aggregatorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
