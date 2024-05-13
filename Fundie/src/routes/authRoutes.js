const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const User = require('../models/userModel');
const { Request, Response } = require('express');

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
    console.log('User registered successfully:', username);
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

    req.session.userId = user._id.toString(); // Store user ID in session
    req.session.role = user.role; // Store user role in session
    req.session.user = { username: user.username, role: user.role }; // Store user details in session
    console.log('User logged in successfully:', username);
    res.send('User logged in');
  } catch (error) {
    console.error('Error during user login:', error.message, error.stack, error);
    res.status(500).send('Server error');
  }
});

module.exports = router;