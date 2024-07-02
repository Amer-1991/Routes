const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Using bcryptjs for compatibility
const jwt = require('jsonwebtoken'); // Added for JWT authentication
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // User model will automatically hash the password using bcryptjs
    await User.create({ username, password });
    console.log('User registered successfully:', username);
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login attempt failed: User not found', username);
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in the environment variables');
        return res.status(500).send('Internal server error');
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('User logged in successfully:', username);
      res.json({ message: 'Authentication successful', token });
    } else {
      console.log('Login attempt failed: Incorrect password', username);
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      console.error(`Error message: ${err.message}`);
      console.error(`Error stack: ${err.stack}`);
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully');
    res.redirect('/auth/login');
  });
});

module.exports = router;