require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createNewAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists with this email');
      return;
    }

    // Create new admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1234567890',
      password: 'admin123',
      deviceId: 'admin-web-device',
      role: 'admin',
      authProvider: 'local',
      status: 'Active',
      otp: {
        verified: true
      }
    });

    await admin.save();

    console.log('✅ New admin created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createNewAdmin();