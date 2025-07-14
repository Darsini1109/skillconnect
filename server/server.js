require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/skillconnect", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes'); // correct path to your routes
app.use('/api/user', userRoutes); // matches frontend fetch URL

// Test default route
app.get('/', (req, res) => {
  res.send("🌟 SkillConnect backend is running!");
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
