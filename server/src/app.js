const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors'); // Added for CORS support

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Changed to 5000 to avoid conflict with frontend

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS to allow frontend requests

// Connect to MongoDB
mongoose.set('strictQuery', false); // Optional to avoid warnings
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Instead of exiting, log and continue (optional retry logic can be added)
  });

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String, // In production, use hashing (e.g., bcrypt)
  role: { type: String, enum: ['mentor', 'mentee'] },
});
const User = mongoose.model('User', userSchema);

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, password, role });
    if (user) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const newUser = new User({ firstName, lastName, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello, SkillConnect server!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});