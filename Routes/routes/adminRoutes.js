const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../routes/middleware/authMiddleware');
const { scrapeOpportunities } = require('../utils/scrapeOpportunities');
const InvestmentOpportunity = require('../models/InvestmentOpportunity');
const logging = require('../utils/logging');
const fs = require('fs');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Unified route for both manual and automatic scraping
router.route('/scrape')
    .all(isAuthenticated)
    .all(async (req, res) => {
        try {
            await scrapeOpportunities(); // Existing scraping function
            logging.log_info('Scraping process initiated and completed successfully.');
            res.send('Scraping process completed successfully.');
        } catch (error) {
            logging.log_error('Failed to initiate scraping process', { message: error.message, stack: error.stack });
            res.status(500).send('Failed to initiate scraping process.');
        }
    });

// Admin panel access route
router.get('/admin', isAuthenticated, (req, res) => {
    try {
        res.render('adminPanel');
        logging.log_info('Admin panel accessed successfully.');
    } catch (error) {
        logging.log_error('Failed to render admin panel', { message: error.message, stack: error.stack });
        res.status(500).send('Failed to render admin panel.');
    }
});

// Admin OTP input page route
router.get('/admin/otp', isAuthenticated, isAdmin, (req, res) => {
    try {
        res.render('adminOtp');
        logging.log_info('Admin OTP page accessed successfully.');
    } catch (error) {
        logging.log_error('Failed to render admin OTP page', { message: error.message, stack: error.stack });
        res.status(500).send('Failed to render admin OTP page.');
    }
});

// POST route for OTP input handling
router.post('/admin/otp-input', isAuthenticated, isAdmin, (req, res) => {
    const { otp } = req.body;

    // Check if OTP is provided and not just whitespace
    if (!otp || otp.trim() === '') {
        return res.status(400).render('adminOtp', { error: 'OTP is required and cannot be empty.' });
    }

    // Redirect to OTP submission route with the validated OTP
    res.redirect('/admin/otp-submit');
});

// Handling OTP submission
router.post('/admin/otp-submit', isAuthenticated, isAdmin, (req, res) => {
    const { otp } = req.body;
    const correctOtp = process.env.ADMIN_OTP; // INPUT_REQUIRED {Set the ADMIN_OTP in your .env file to the OTP you want to use for admin authentication}

    if (!otp || otp.trim() === '') {
        logging.log_error('OTP input is empty');
        return res.status(400).render('adminOtp', { error: 'OTP is required and cannot be empty.' });
    }

    if (otp === correctOtp) {
        req.session.isAuthenticatedAdmin = true; // Set a flag in the session
        logging.log_info('OTP verified successfully, admin authenticated.');
        res.redirect('/admin/scrape-secure'); // Redirect to the new secure scraping route
    } else {
        logging.log_error('Invalid OTP provided');
        res.status(401).send('Invalid OTP');
    }
});

// New route for secure scraping after OTP verification
router.get('/scrape-secure', isAuthenticated, isAdmin, async (req, res) => {
    if (req.session.isAuthenticatedAdmin) {
        try {
            const result = await scrapeOpportunities(); // Call the scraping function
            res.send(result);
        } catch (error) {
            logging.log_error('Failed to initiate secure scraping', { message: error.message, stack: error.stack });
            res.status(500).send('Failed to initiate secure scraping.');
        }
    } else {
        logging.log_error('Unauthorized access attempt to secure scraping');
        res.status(403).send('Unauthorized access');
    }
});

// Route to update scraping URLs
router.post('/admin/update-urls', isAuthenticated, isAdmin, (req, res) => {
    const { scrapingUrls } = req.body;
    if (!scrapingUrls) {
        logging.log_error('No URLs provided for updating');
        return res.status(400).send('Scraping URLs are required');
    }
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        envConfig.SCRAPING_URLS = scrapingUrls;
        const newEnv = Object.keys(envConfig).map(key => `${key}=${envConfig[key]}`).join('\n');
        fs.writeFileSync(envPath, newEnv);
        logging.log_info('Scraping URLs updated successfully.');
        const { restartServer } = require('../server');
        restartServer();
        res.redirect('/admin');
    } catch (error) {
        logging.log_error('Failed to update scraping URLs', { message: error.message, stack: error.stack });
        res.status(500).send('Failed to update scraping URLs');
    }
});

module.exports = router;