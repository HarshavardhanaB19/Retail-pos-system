const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Branch = require('./models/Branch');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (safe for demo/dev only)
    await Branch.deleteMany({});
    await User.deleteMany({});

    // Create a branch
    const branch = await Branch.create({
      name: 'Main Branch',
      location: 'Bangalore'
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create super admin
    const admin = await User.create({
      name: 'Harsha Admin',
      email: 'admin@pos.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      branchId: branch._id
    });

    console.log('Seed data created:');
    console.log('Branch:', branch.name);
    console.log('Super Admin login → email: admin@pos.com | password: password123');

    // Create a cashier for role demo
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await User.create({
      name: 'Ravi Cashier',
      email: 'cashier@pos.com',
      password: cashierPassword,
      role: 'CASHIER',
      branchId: branch._id
    });
    console.log('Cashier login → email: cashier@pos.com | password: cashier123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
