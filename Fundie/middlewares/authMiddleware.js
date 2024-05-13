const express = require('express');

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('User is authenticated, proceeding to next middleware');
    next();
  } else {
    console.error('User is not authenticated');
    res.redirect('/login');  // Redirect to login page instead of just sending a status
  }
};

// Middleware to check if the user has the required role
const checkRole = (roles) => (req, res, next) => {
  if (req.session && roles.includes(req.session.role)) {
    console.log(`User role is authorized as ${req.session.role}`);
    next();
  } else {
    console.error(`User role ${req.session.role} is not authorized`);
    res.status(403).send('User role not authorized');
  }
};

module.exports = { ensureAuthenticated, checkRole };