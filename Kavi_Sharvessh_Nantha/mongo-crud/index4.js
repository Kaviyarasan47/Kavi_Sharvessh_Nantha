require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const saltRounds = 10;
const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'e_hailing_system'; // Change this to your DB name
let db;

// Connect to MongoDB
client.connect().then(() => {
  db = client.db(dbName);
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.error("❌ MongoDB connection failed:", err);
});

// Registration Route
app.post('/users', async (req, res) => {
  try {
    console.log("Incoming request body:", req.body); // 👈 Log the incoming data

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = { ...req.body, password: hashedPassword };

    console.log("User to insert:", user); // 👈 Log the final user object

    await db.collection('users').insertOne(user);

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("❌ Registration error:", err); // 👈 Log the real error
    res.status(400).json({ error: "Registration failed" });
  }
});

// Login Route
app.post('/auth/login', async (req, res) => {
  const user = await db.collection('users').findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({ token });
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role Middleware
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

app.delete('/delete/:id', authenticate, authorize(['admin']), async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No user found to delete' });
    }

    // Use 200 so the message is visible
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start the Server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});