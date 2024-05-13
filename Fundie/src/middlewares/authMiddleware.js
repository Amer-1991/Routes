const express = require('express');

// Middleware to ensure the user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        console.log('User is authenticated');
        return next();
    } else {
        console.log('User is not authenticated');
        res.redirect('/login');
    }
};

// Middleware to check if the user has the required role
exports.checkRole = (roles) => (req, res, next) => {
    if (req.session && roles.includes(req.session.role)) {
        console.log(`User role is authorized: ${req.session.role}`);
        return next();
    } else {
        console.error(`Unauthorized access attempt by role: ${req.session.role}`);
        res.status(403).send('Access Denied: You do not have permission to perform this action.');
    }
};