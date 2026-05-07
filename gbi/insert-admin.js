// insert-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure this path matches your model file
require('dotenv').config();

async function insertAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Admin user data
    const adminData = {
      name: 'አስተዳዳሪ',
      email: 'admin@gbi.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin',
      department: 'አስተዳደር',
      departmentAmharic: 'አስተዳዳሪ',
      phone: '0912345678',
      permissions: ['all_permissions', 'manage_users', 'view_all'],
      level: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with email:', adminData.email);
      console.log('   Updating password to ensure it works...');
      
      // Update password
      existingAdmin.password = adminData.password;
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully');
      console.log('   Name:', existingAdmin.name);
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
    } else {
      // Create new admin user
      const admin = new User(adminData);
      await admin.save();
      
      console.log('✅ Admin user created successfully');
      console.log('   Name:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Department:', admin.department);
    }

    // Verify the password works
    const user = await User.findOne({ email: adminData.email });
    const isPasswordValid = await user.comparePassword('admin123');
    
    console.log('\n🔐 Password verification:');
    console.log(`   Password 'admin123' is: ${isPasswordValid ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Show all users in database
    const allUsers = await User.find().select('email role name');
    console.log('\n📋 All users in database:');
    allUsers.forEach(u => console.log(`   - ${u.email} (${u.role}) - ${u.name}`));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
insertAdminUser();