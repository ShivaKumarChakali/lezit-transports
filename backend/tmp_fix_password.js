const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezit-transports';
    await mongoose.connect(mongoURI);
    const UserModule = require('./dist/models/User');
    const User = UserModule && UserModule.default ? UserModule.default : UserModule;
    const user = await User.findOne({ email: 'admin@lezittransports.com' });
    if (!user) {
      console.log('Admin user not found');
      process.exit(1);
    }
    user.password = 'admin123';
    await user.save();
    console.log('Password reset to plaintext and re-hashed on save');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
