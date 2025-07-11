const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanagement');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nExisting collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Test creating a simple document
    const testCollection = conn.connection.db.collection('test');
    const result = await testCollection.insertOne({
      message: 'Hello from Task Management System!',
      timestamp: new Date()
    });
    console.log('\n✅ Test document created with ID:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('\n🎉 MongoDB connection test successful!');
    console.log('\nYou can now:');
    console.log('1. Open MongoDB Compass');
    console.log('2. Connect to: mongodb://127.0.0.1:27017');
    console.log('3. Browse the "taskmanagement" database');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
