const express = require('express');
const User = require('../models/User');
const { isAuthenticated, roleCheck } = require('./middleware/authMiddleware');
const router = express.Router();

// Endpoint to fetch students based on guardian's ID
router.get('/students', isAuthenticated, roleCheck(['Guardian']), async (req, res) => {
  try {
    const guardianId = req.session.userId;
    const students = await User.find({ guardianId: guardianId }).select('fullName status');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching student data' });
  }
});

module.exports = router;