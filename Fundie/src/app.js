const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./models/userModel');
const { fetchAllUsers, showRequestFundForm } = require('./controllers/userController');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/authRoutes');
const fs = require('fs');
const fundraiserRoutes = require('./routes/fundraiserRoutes');
const bankRoutes = require('./routes/bankRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { ensureAuthenticated, checkRole } = require('./middlewares/authMiddleware');
const { handleErrors } = require('./utils/errorHandlers');

dotenv.config();
const app = express();
app.use(express.json());

try {
  connectDB().catch(error => {
    console.error('MongoDB connection failed', error);
    fs.appendFileSync('app.log', `MongoDB connection failed: ${error}\n`);
    process.exit(1);
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // INPUT_REQUIRED {Please ensure SESSION_SECRET is set in your .env file}
    resave: false,
    saveUninitialized: false, // Changed to false to prevent session being saved without modification
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
  }));

  app.use(flash());

  app.use((req, res, next) => {
    if (req.session && req.session.userId) {
      return next();
    } else {
      console.log('User is not authenticated, redirecting to login');
      res.redirect('/auth/login');
    }
  });

  app.get('/', (req, res) => {
    if (req.session.userId) {
      res.redirect('/api/users');
    } else {
      res.redirect('/auth/login');
    }
  });

  if (typeof fetchAllUsers !== 'function') {
    console.error('fetchAllUsers is not a function, please check the export/import.');
    process.exit(1);
  }
  app.get('/api/users', fetchAllUsers);

  app.get('/fundraiser/request-fund', showRequestFundForm);

  app.get('/health', (req, res) => {
    res.send('API is running');
    console.log('Health check performed successfully');
  });

  app.use('/auth', authRoutes);
  app.use('/fundraiser', checkRole(['fundraiser']), fundraiserRoutes);
  app.use('/bank', checkRole(['bank']), bankRoutes);
  app.use('/admin', checkRole(['admin']), adminRoutes);

  app.use((error, req, res, next) => {
    handleErrors(error, 'API', req, res, next);
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    fs.appendFileSync('app.log', `Server running on port ${PORT}\n`);
  });
} catch (error) {
  console.error('Failed to start the server:', error.message, error);
  fs.appendFileSync('app.log', `Failed to start the server: ${error.message}\n${error.stack}\n`);
  process.exit(1);
}