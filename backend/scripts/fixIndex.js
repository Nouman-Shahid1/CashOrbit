require('dotenv').config();
const mongoose = require('mongoose');

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // Drop the problematic username index
    try {
      await collection.dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (error) {
      console.log('Index may not exist:', error.message);
    }
    
    // List remaining indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixIndex();