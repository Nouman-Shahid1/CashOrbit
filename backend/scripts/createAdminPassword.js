require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@cashorbit.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    // Add password to admin
    admin.password = 'admin123'; // Set your desired password
    admin.authProvider = 'local'; // Enable password auth
    await admin.save();

    console.log('✅ Admin password set successfully!');
    console.log('📧 Email: admin@cashorbit.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminPassword();