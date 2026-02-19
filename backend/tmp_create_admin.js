const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezit-transports';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const UserModule = require('./dist/models/User');
    const User = UserModule && UserModule.default ? UserModule.default : UserModule;

    const existing = await User.findOne({ email: 'admin@lezittransports.com' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash('admin123', 12);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@lezittransports.com',
      password: hashed,
      phone: '9876543210',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('Admin created: admin@lezittransports.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();

