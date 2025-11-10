// 📚 Simple MongoDB Test Script
// Ye script sirf MongoDB connection aur data save ko test karta hai
// Shopify dependencies ki zarurat nahi hai!

import mongoose from "mongoose";
import express from "express";

// ============================================
// MONGODB CONNECTION
// ============================================
// const MONGO_URI = "mongodb://localhost:27017/shopify-tutorial-app";
const MONGO_URI = "mongodb+srv://sarim:ltBPWPHTceMWonL2@cluster0.lhg8hhc.mongodb.net/power?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    
    console.log("\n🎉 ============================================");
    console.log("   ✅ MongoDB Connected Successfully!");
    console.log("   📍 Database:", mongoose.connection.name);
    console.log("   🔗 Host:", mongoose.connection.host);
    console.log("============================================\n");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("💡 Tip: Make sure MongoDB is running!");
    console.error("   Run: net start MongoDB");
  }
};

// ============================================
// USER SCHEMA & MODEL
// ============================================
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  terms: {
    type: Boolean,
    required: true,
    default: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// ============================================
// EXPRESS SERVER
// ============================================
const app = express();
const PORT = 3001; // Different port to avoid conflicts

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// TEST ROUTES
// ============================================

// GET - Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "🎉 Test Server is Running!",
    mongodb: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    endpoints: {
      health: "GET /",
      register: "POST /register",
      users: "GET /users",
      testData: "POST /test-data"
    }
  });
});

// POST - Register User (Form submission test)
app.post('/register', async (req, res) => {
  try {
    console.log('\n📩 ============ REGISTRATION REQUEST ============');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { fullName, email, phone, password, confirmPassword, terms } = req.body;
    
    // Validation
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (!terms) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to terms and conditions'
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected. Attempting to connect...');
      await connectDB();
    }
    
    // Check existing user
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered.'
      });
    }
    
    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password,
      terms
    });
    
    // Save to database
    const savedUser = await newUser.save();
    
    console.log('✅ User saved successfully!');
    console.log('📋 User Data:', {
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      phone: savedUser.phone,
      registeredAt: savedUser.registeredAt
    });
    console.log('================================================\n');
    
    res.status(200).json({
      success: true,
      message: `Registration successful! Welcome, ${fullName}! 🎉`,
      data: {
        id: savedUser._id,
        email: savedUser.email,
        registeredAt: savedUser.registeredAt
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to save user data',
      error: error.message
    });
  }
});

// GET - All Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')  // Password hide karo
      .sort({ createdAt: -1 }); // Latest first
      
    console.log(`📋 Fetched ${users.length} users from database`);
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Insert Test Data
app.post('/test-data', async (req, res) => {
  try {
    const testUser = {
      fullName: "Test User " + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone: "1234567890",
      password: "password123",
      terms: true
    };
    
    const user = await User.create(testUser);
    
    console.log('✅ Test user created:', user.email);
    
    res.json({
      success: true,
      message: "Test user created!",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, async () => {
  console.log('\n🚀 ============================================');
  console.log(`   Test Server running on http://localhost:${PORT}`);
  console.log('============================================');
  
  // Connect to MongoDB
  await connectDB();
  
  console.log('\n📝 Available Endpoints:');
  console.log(`   🏠 Health: http://localhost:${PORT}/`);
  console.log(`   📋 Users: http://localhost:${PORT}/users`);
  console.log(`   ✍️  Register: POST http://localhost:${PORT}/register`);
  console.log(`   🧪 Test Data: POST http://localhost:${PORT}/test-data`);
  console.log('\n💡 Test karne ke liye:');
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(`   curl http://localhost:${PORT}/users`);
  console.log('\n');
});

