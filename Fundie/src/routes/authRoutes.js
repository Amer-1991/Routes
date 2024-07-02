const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const User = require('../models/userModel');
const { Request, Response } = require('express');
const sessionManagement = require('../utils/sessionManagement'); // Import session management utility

const router = express.Router();

// User registration
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  check('role', 'Invalid role').isIn(['fundraiser', 'bank', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors during registration:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      console.log('Attempt to register with an already existing username:', username);
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    user = new User({
      username,
      password,
      role
    });

    await user.save();
    sessionManagement.initializeUserSession(req, user); // Use the session management utility
    console.log('User registered successfully with session:', username);
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error during user registration:', error.message, error.stack, error);
    res.status(500).send('Server error');
  }
});

// User login
router.post('/login', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors during login:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      console.log('Login attempt with non-existent username:', username);
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password attempt for user:', username);
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    if (req.session) {
      req.session.userId = user._id.toString(); // Store user ID in session
      req.session.role = user.role; // Store user role in session
      console.log('Session variables set successfully:', `UserID: ${req.session.userId}, Role: ${req.session.role}`);
      res.send('User logged in');
    } else {
      console.error('Session not initialized');
      return res.status(500).send('Failed to initialize session');
    }
  } catch (error) {
    console.error('Error during user login:', error.message, error.stack, error);
    res.status(500).send('Server error');
  }
});

// GET route for login page
router.get('/login', (req, res) => {
  try {
    res.render('login'); // Render the login view
    console.log('Rendering login page');
  } catch (error) {
    console.error('Error rendering login page:', error.message, error.stack);
    res.status(500).send('Server error');
  }
});

module.exports = router;