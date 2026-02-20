const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@cashorbit.com' });

    // Create admin user (password will be hashed by pre-save middleware)
    const admin = new User({
      name: 'Admin',
      email: 'admin@cashorbit.com',
      phone: 'admin@cashorbit.com',
      password: 'Hello123',
      role: 'admin',
      status: 'Active',
      deviceId: 'admin-device',
      authProvider: 'local'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@cashorbit.com');
    console.log('🔑 Password: Hello123');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();