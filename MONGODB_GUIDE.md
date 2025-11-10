# 📚 MongoDB + Mongoose Learning Guide

**Congratulations! 🎉** Aapka MongoDB connection setup complete ho gaya hai!

---

## 🎯 Kya Kya Setup Hua?

### ✅ 1. **MongoDB Connection**
- MongoDB URI: `mongodb://localhost:27017/shopify-tutorial-app`
- Connection function: `connectDB()`
- Error handling aur event listeners

### ✅ 2. **User Schema & Model**
- User ka blueprint/structure define kiya
- Fields: fullName, email, phone, password, terms, registeredAt
- Validation rules add kiye (required, unique, email format, etc.)

### ✅ 3. **Form Data Save Functionality**
- POST route `/api/app-proxy` ab MongoDB mein data save karta hai
- Duplicate email check
- Proper error handling

---

## 🚀 Kaise Test Karein?

### **Step 1: MongoDB Start Karo**

Windows mein MongoDB start karne ke liye:

```bash
# Method 1: Service se (agar installed hai)
net start MongoDB

# Method 2: Manual start
mongod --dbpath "C:\data\db"
```

**Note:** Agar `data\db` folder nahi hai to pehle create karo:
```bash
mkdir C:\data\db
```

---

### **Step 2: Server Start Karo**

```bash
npm run dev
# ya
npm start
```

**Expected Console Output:**
```
✅ ============================================
   🚀 Express Server running on port 3000
   🔗 App Proxy endpoint: /api/app-proxy
   📝 Ready to receive form data!
============================================

🎉 ============================================
   ✅ MongoDB Connected Successfully!
   📍 Database: shopify-tutorial-app
   🔗 Host: localhost
============================================
```

---

### **Step 3: Form Submit Karo**

Apna registration form fill karo aur submit karo. Console mein ye messages dikhenge:

```
📩 ============ APP PROXY POST REQUEST ============
✅ Form data validated successfully
💾 Saving user data to MongoDB...
✅ User saved to MongoDB successfully!
📋 Saved User Data: { fullName: '...', email: '...', ... }
```

---

## 📖 Key Learning Concepts

### **1. Mongoose Connection**
```javascript
await mongoose.connect(MONGO_URI);
```
- Ye MongoDB se connection banata hai
- `async/await` isliye use karte hain kyunki connection me time lagta hai

---

### **2. Schema (Data Blueprint)**
```javascript
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,      // Data type
    required: true,    // Zaroori field
    trim: true         // Extra spaces remove
  },
  email: {
    type: String,
    unique: true,      // Duplicate nahi allowed
    lowercase: true    // Always lowercase mein save
  }
});
```

**Schema Kya Hai?**
- Data ka structure/blueprint define karta hai
- Validation rules add kar sakte hain
- Default values set kar sakte hain

---

### **3. Model (Database Operations)**
```javascript
const User = mongoose.model('User', userSchema);
```

**Model se kya kar sakte hain?**
- `.save()` - Data save karo
- `.find()` - Data search karo
- `.findOne()` - Single document dhundo
- `.updateOne()` - Data update karo
- `.deleteOne()` - Data delete karo

---

### **4. Data Save Karna**
```javascript
// Step 1: New user object banao
const newUser = new User({
  fullName: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  password: "password123",
  terms: true
});

// Step 2: Database mein save karo
const savedUser = await newUser.save();
```

---

### **5. Data Find Karna**
```javascript
// Single user dhundo (email se)
const user = await User.findOne({ email: "john@example.com" });

// All users dhundo
const allUsers = await User.find();

// Specific fields dhundo (name ke sath 'John')
const users = await User.find({ 
  fullName: { $regex: 'John', $options: 'i' } 
});
```

---

## 🔍 MongoDB Data Kaise Dekhein?

### **Method 1: MongoDB Compass (GUI Tool)**
1. MongoDB Compass download karo: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Database: `shopify-tutorial-app`
4. Collection: `users`

---

### **Method 2: Mongo Shell (Command Line)**
```bash
# Mongo shell start karo
mongosh

# Database select karo
use shopify-tutorial-app

# All users dekho
db.users.find()

# Pretty format mein dekho
db.users.find().pretty()

# Count karo kitne users hain
db.users.countDocuments()

# Specific user dhundo
db.users.findOne({ email: "john@example.com" })
```

---

## 🎓 Practice Exercises

### **Exercise 1: Read Operation**
`index.js` mein naya route banao to get all users:

```javascript
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // password hide karo
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### **Exercise 2: Update Operation**
User ka data update karne ke liye:

```javascript
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullName, phone },
      { new: true } // Updated document return kare
    );
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### **Exercise 3: Delete Operation**
User delete karne ke liye:

```javascript
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## ⚠️ Important Security Notes

### **1. Password Hashing (ZAROORI!)**

Abhi passwords plain text mein save ho rahe hain. **Production mein ye bahut dangerous hai!**

**Solution: bcrypt use karo**

```bash
npm install bcrypt
```

```javascript
import bcrypt from 'bcrypt';

// Signup time (password hash karo)
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({
  fullName,
  email,
  password: hashedPassword  // Hashed password save karo
});

// Login time (password verify karo)
const user = await User.findOne({ email });
const isMatch = await bcrypt.compare(password, user.password);
```

---

### **2. Environment Variables**

MongoDB URI ko `.env` file mein rakho:

```bash
# .env file
MONGO_URI=mongodb://localhost:27017/shopify-tutorial-app
```

```javascript
// index.js
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/shopify-tutorial-app";
```

---

## 🛠️ Common Errors & Solutions

### **Error 1: MongoNetworkError**
```
❌ MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** MongoDB service start karo (`net start MongoDB` ya `mongod`)

---

### **Error 2: Duplicate Key Error**
```
❌ E11000 duplicate key error collection: users index: email_1 dup key
```
**Solution:** Email already registered hai. Ye expected behavior hai (validation working!)

---

### **Error 3: Validation Error**
```
❌ User validation failed: email: Please provide a valid email
```
**Solution:** Form mein valid data enter karo (email format check karo)

---

## 📚 Additional Resources

1. **Mongoose Documentation:** https://mongoosejs.com/docs/guide.html
2. **MongoDB University (Free Courses):** https://university.mongodb.com/
3. **Mongoose Queries:** https://mongoosejs.com/docs/queries.html
4. **Mongoose Validation:** https://mongoosejs.com/docs/validation.html

---

## 🎉 Next Steps

1. ✅ MongoDB Compass install karo data visually dekhne ke liye
2. ✅ Practice exercises try karo
3. ✅ Password hashing implement karo (bcrypt)
4. ✅ More complex schemas try karo (nested objects, arrays, etc.)
5. ✅ Mongoose middleware explore karo (pre/post hooks)

---

**Happy Learning! 🚀**

Agar koi doubt hai to mujhse pooch sakte ho!

