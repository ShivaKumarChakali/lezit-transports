const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezit-transports';
    await mongoose.connect(mongoURI);
    const UserModule = require('./dist/models/User');
    const User = UserModule && UserModule.default ? UserModule.default : UserModule;
    const u = await User.findOne({ email: 'admin@lezittransports.com' }).lean();
    console.log('User:', u);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
