const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Using bcryptjs for compatibility across architectures
const { isAuthenticated, roleCheck } = require('./middleware/authMiddleware');
const router = express.Router();

// Utility function to handle logging and errors
function handleRequestOutcome(logMessage, errorMessage, error, res, statusCode, redirectPath) {
  if (error) {
    console.error(errorMessage, error);
    return res.status(statusCode).send(error.message);
  }
  console.log(logMessage);
  if (redirectPath) {
    res.redirect(redirectPath);
  }
}

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role, fullName, nationalNumber, phoneNumber, class: studentClass } = req.body;
    const existingUser = await User.findOne({ nationalNumber });
    if (existingUser) {
      return handleRequestOutcome(
        `Attempt to register with an already used national number: ${nationalNumber}`,
        'Registration error: National Number already in use',
        new Error('National Number already in use'),
        res,
        400
      );
    }
    const newUser = await User.create({ username, password, role, fullName, nationalNumber, phoneNumber, class: studentClass });
    handleRequestOutcome('User registered successfully: ' + newUser.username, null, null, res, null, '/auth/login');
  } catch (error) {
    handleRequestOutcome(null, 'Registration error:', error, res, 500);
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
      return handleRequestOutcome(
        `Login attempt failed - user not found: ${username}`,
        'Login error: User not found',
        new Error('User not found'),
        res,
        400
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      req.session.role = user.role;  // Store user role in session
      // Redirect based on user role
      const redirectPath = {
        'Guardian': '/guardianDashboard',
        'Security Guard': '/securityDashboard',
        'School Admin': '/schoolAdminDashboard',
        'Super Admin': '/superAdminDashboard'
      }[user.role] || '/';
      handleRequestOutcome('User logged in successfully: ' + username, null, null, res, null, redirectPath);
    } else {
      handleRequestOutcome(
        `Login attempt failed - incorrect password: ${username}`,
        'Login error: Password is incorrect',
        new Error('Password is incorrect'),
        res,
        400
      );
    }
  } catch (error) {
    handleRequestOutcome(null, 'Login error:', error, res, 500);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      handleRequestOutcome(null, 'Error during session destruction:', err, res, 500);
    } else {
      handleRequestOutcome('User logged out successfully', null, null, res, null, '/auth/login');
    }
  });
});

// Dashboard routes with role checks
router.get('/guardianDashboard', isAuthenticated, roleCheck(['Guardian']), (req, res) => {
  res.render('guardianDashboard');
});
router.get('/securityDashboard', isAuthenticated, roleCheck(['Security Guard']), async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' }); // Fetch all students
    if (students.length === 0) {
      console.log('No students found in the database.');
      res.render('securityDashboard', { students: [], message: 'No student data available.' });
    } else {
      res.render('securityDashboard', { students });
    }
  } catch (error) {
    console.error('Failed to fetch students for security dashboard:', error);
    res.status(500).render('securityDashboard', { students: [], message: 'Failed to load student data.' });
  }
});
router.get('/schoolAdminDashboard', isAuthenticated, roleCheck(['School Admin']), (req, res) => {
  res.render('schoolAdminDashboard');
});
router.get('/superAdminDashboard', isAuthenticated, roleCheck(['Super Admin']), (req, res) => {
  res.render('superAdminDashboard');
});

router.post('/updateStudentStatus', isAuthenticated, roleCheck(['Security Guard']), async (req, res) => {
  try {
    const { studentId, status } = req.body;
    const updatedStudent = await User.findByIdAndUpdate(studentId, { status }, { new: true });
    req.app.get('io').emit('statusUpdated', { studentId: updatedStudent._id, status: updatedStudent.status });
    res.send('Status updated successfully');
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).send('Error updating status');
  }
});

module.exports = router;