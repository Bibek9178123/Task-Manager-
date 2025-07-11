const axios = require('axios');

const testUserRegistration = async () => {
  try {
    console.log('Testing user registration...');
    
    // Test data for a new user
    const userData = {
      name: 'Demo User',
      email: 'demo@taskmanager.com',
      password: 'demo123'
    };
    
    // Register user
    const response = await axios.post('http://localhost:5000/api/auth/register', userData);
    
    console.log('✅ User registration successful!');
    console.log('User ID:', response.data.data.user.id);
    console.log('User Name:', response.data.data.user.name);
    console.log('User Email:', response.data.data.user.email);
    console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
    
    // Test login with the same credentials
    console.log('\nTesting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: userData.email,
      password: userData.password
    });
    
    console.log('✅ Login successful!');
    console.log('Welcome back:', loginResponse.data.data.user.name);
    
    console.log('\n🎉 Database connection is working perfectly!');
    console.log('\nYou can now:');
    console.log('1. Open MongoDB Compass');
    console.log('2. Connect to: mongodb://127.0.0.1:27017');
    console.log('3. Browse the "taskmanagement" database');
    console.log('4. See the "users" collection with your demo user');
    console.log('5. Open http://localhost:3000 to use the web app');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data.message);
      if (error.response.data.message.includes('already exists')) {
        console.log('\n✅ User already exists in database - connection is working!');
        
        // Try login instead
        try {
          const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo@taskmanager.com',
            password: 'demo123'
          });
          console.log('✅ Login successful with existing user!');
          console.log('User:', loginResponse.data.data.user.name);
        } catch (loginError) {
          console.error('❌ Login failed:', loginError.response?.data?.message || loginError.message);
        }
      }
    } else {
      console.error('❌ Connection Error:', error.message);
      console.log('Make sure the server is running on http://localhost:5000');
    }
  }
};

testUserRegistration();
