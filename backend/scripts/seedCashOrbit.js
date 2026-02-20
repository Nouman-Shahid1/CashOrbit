const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Task = require('../models/Task');
const User = require('../models/User');
require('dotenv').config();

const seedCashOrbitData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Plan.deleteMany({});
    await Task.deleteMany({});
    
    // Create plans
    const plans = [
      {
        name: 'Free',
        depositAmount: 0,
        dailyTasks: '3',
        coinMultiplier: '1x',
        withdrawLimit: 300,
        coinRate: 0.5,
        featured: false
      },
      {
        name: 'Basic',
        depositAmount: 5000,
        dailyTasks: '10',
        coinMultiplier: '2x',
        withdrawLimit: 1000,
        coinRate: 1,
        featured: false
      },
      {
        name: 'Standard',
        depositAmount: 15000,
        dailyTasks: '20',
        coinMultiplier: '4x',
        withdrawLimit: 3000,
        coinRate: 2,
        featured: true
      },
      {
        name: 'Premier',
        depositAmount: 30000,
        dailyTasks: 'Unlimited',
        coinMultiplier: '6x',
        withdrawLimit: 7000,
        coinRate: 3,
        featured: false
      }
    ];

    const createdPlans = await Plan.insertMany(plans);
    console.log('Plans created:', createdPlans.length);

    // Create sample tasks
    const tasks = [
      {
        title: 'Watch promotional video',
        type: 'Watch Video',
        description: 'Watch our promotional video to earn coins',
        coins: 50,
        dailyLimit: 5,
        watchTime: 30,
        videoUrl: 'https://example.com/video1.mp4'
      },
      {
        title: 'Install shopping app',
        type: 'Install App',
        description: 'Install our partner shopping app from Play Store',
        coins: 100,
        dailyLimit: 3,
        appLink: 'https://play.google.com/store/apps/details?id=com.example.shop',
        appName: 'ShopEasy'
      },
      {
        title: 'Follow Instagram account',
        type: 'Manual Task',
        description: 'Follow our Instagram account and take a screenshot',
        coins: 75,
        dailyLimit: 2,
        instructions: 'Follow @cashorbit on Instagram and submit a screenshot as proof',
        requiresScreenshot: true
      },
      {
        title: 'Watch tutorial video',
        type: 'Watch Video',
        description: 'Watch tutorial video about app features',
        coins: 40,
        dailyLimit: 3,
        watchTime: 45,
        videoUrl: 'https://example.com/tutorial.mp4'
      },
      {
        title: 'Rate our app',
        type: 'Manual Task',
        description: 'Rate our app 5 stars on Play Store',
        coins: 150,
        dailyLimit: 1,
        instructions: 'Rate CashOrbit app 5 stars on Google Play Store and submit screenshot',
        requiresScreenshot: true
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log('Tasks created:', createdTasks.length);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@cashorbit.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin',
        email: 'admin@cashorbit.com',
        phone: 'admin@cashorbit.com',
        deviceId: 'admin-device',
        role: 'admin',
        status: 'Active',
        plan: createdPlans[0]._id, // Free plan
        otp: {
          verified: true
        }
      });
      await admin.save();
      console.log('Admin user created');
    }

    console.log('✅ CashOrbit seed data created successfully!');
    console.log('📧 Admin login: admin@cashorbit.com');
    console.log('🔑 Use OTP: 1234 for admin login');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedCashOrbitData();