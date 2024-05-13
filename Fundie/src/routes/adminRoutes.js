const express = require('express');
const { ensureAuthenticated, checkRole } = require('../../middlewares/authMiddleware');
const FundraiserModel = require('../models/fundraiserModel');
const UserModel = require('../models/userModel');
const OfferModel = require('../models/offerModel');

const router = express.Router();

// Middleware to ensure only admins can access the routes
router.use(ensureAuthenticated);
router.use(checkRole('admin'));

// Route to view all funding requests
router.get('/all-requests', async (req, res) => {
    try {
        const requests = await FundraiserModel.find();
        console.log('Retrieved all funding requests for admin');
        res.render('admin/allRequests', { requests });
    } catch (error) {
        console.error('Error retrieving funding requests:', error.message, error.stack);
        res.status(500).send('Error retrieving funding requests');
    }
});

// Route to manage users
router.get('/manage-users', async (req, res) => {
    try {
        const users = await UserModel.find();
        console.log('Retrieved all users for admin management');
        res.render('admin/manageUsers', { users });
    } catch (error) {
        console.error('Error retrieving users:', error.message, error.stack);
        res.status(500).send('Error retrieving users');
    }
});

// Route to view all offers
router.get('/all-offers', async (req, res) => {
    try {
        const offers = await OfferModel.find();
        console.log('Retrieved all offers for admin');
        res.render('admin/allOffers', { offers });
    } catch (error) {
        console.error('Error retrieving offers:', error.message, error.stack);
        res.status(500).send('Error retrieving offers');
    }
});

module.exports = router;