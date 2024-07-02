const express = require('express');
const { verifyUserCredentials } = require('../utils/commonAuthFunctions'); // Importing the centralized user verification function
const { handleAuthError } = require('../utils/handleAuthErrors'); // Importing the error handling utility
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // User model will automatically hash the password using bcryptjs
    const hashedPassword = await bcryptjs.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    handleAuthError(res, 'Failed to register user.', 500); // Standardized error handling
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await verifyUserCredentials(username, password);
    if (!user) {
      handleAuthError(res, 'User not found', 400); // Standardized error handling
      return;
    }
    req.session.userId = user._id;
    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    handleAuthError(res, 'Failed to log in user.', 500); // Standardized error handling
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err.message, err.stack);
      handleAuthError(res, 'Error logging out', 500); // Standardized error handling
      return;
    }
    res.redirect('/auth/login');
  });
});

// Admin login route for accessing scraping functionality
router.post('/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = await verifyUserCredentials(username, password);
    if (!adminUser || !adminUser.isAdmin) {
      handleAuthError(res, 'Admin user not found or incorrect password', 404);
      return;
    }
    req.session.userId = adminUser._id;
    req.session.isAdmin = true; // Set a flag in session to indicate this is an admin session
    res.redirect('/admin/otp');
  } catch (error) {
    console.error('Admin login error:', error.message, error.stack);
    handleAuthError(res, 'Error processing admin login', 500);
  }
});

module.exports = router;