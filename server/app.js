const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const bulkRoutes = require('./routes/bulkRoutes');
app.use('/api/bulk', bulkRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('✅ SkillConnect backend is up and running');
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/skillconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
});
