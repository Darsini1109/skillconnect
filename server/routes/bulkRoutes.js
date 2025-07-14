const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');          // Protect routes with JWT
const roleAuth = require('../middleware/roleAuth');            // Role-based authorization

// Example import controller (you can replace with actual logic)
const importController = (req, res) => {
  res.status(200).json({ message: "Bulk import logic executed successfully!" });
};

// Admin-only route for bulk import
router.post('/import', authMiddleware, roleAuth('admin'), importController);

module.exports = router;