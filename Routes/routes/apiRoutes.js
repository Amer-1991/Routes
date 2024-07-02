const express = require('express');
const router = express.Router();
const InvestmentOpportunity = require('../models/InvestmentOpportunity');

// Function to handle errors and log them
const handleApiError = (res, error) => {
    console.error('Error retrieving data from database:', error.message, error.stack);
    res.status(500).json({ message: "Error retrieving data from database.", error: error });
};

router.get('/opportunities', async (req, res) => {
    try {
        let query = {};
        const { duration, name, provider, status, type, websiteSource, uniqueInvestmentIdentifier, newInvestmentTerm } = req.query;

        // Escaping special characters in regex to prevent regex injection
        const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        if (duration) query.duration = { $regex: escapeRegex(duration), $options: 'i' };
        if (name) query.opportunityName = { $regex: escapeRegex(name), $options: 'i' };
        if (provider) query.provider = { $regex: escapeRegex(provider), $options: 'i' };
        if (status) query.status = { $regex: escapeRegex(status), $options: 'i' };
        if (type) query.type = { $regex: escapeRegex(type), $options: 'i' };
        if (websiteSource) query.websiteSource = { $regex: escapeRegex(websiteSource), $options: 'i' };
        if (uniqueInvestmentIdentifier) query.uniqueInvestmentIdentifier = { $regex: escapeRegex(uniqueInvestmentIdentifier), $options: 'i' };
        if (newInvestmentTerm) query.newInvestmentTerm = { $regex: escapeRegex(newInvestmentTerm), $options: 'i' };

        console.log("Query Parameters:", req.query);
        console.log("Constructed MongoDB Query:", query);

        const opportunities = await InvestmentOpportunity.find(query).sort({ timeToOpen: 1 });
        if (opportunities.length === 0) {
            console.log('No investment opportunities found matching the criteria.');
            res.status(404).json({ message: "No investment opportunities found." });
        } else {
            console.log('Fetched investment opportunities successfully.');
            res.set('Cache-Control', 'public, max-age=300');
            res.json(opportunities.map(op => ({
                duration: op.duration,
                opportunityName: op.opportunityName,
                provider: op.provider,
                minimumAmountPerShare: op.minimumAmountPerShare,
                timeToOpen: op.timeToOpen,
                status: op.status,
                type: op.type,
                targetAmount: op.targetAmount,
                ROI: op.ROI,
                APR: op.APR,
                websiteSource: op.websiteSource,
                uniqueInvestmentIdentifier: op.uniqueInvestmentIdentifier,
                newInvestmentTerm: op.newInvestmentTerm
            })));
        }
    } catch (error) {
        handleApiError(res, error);
    }
});

// Endpoint to fetch scraping URLs
router.get('/scraping-urls', (req, res) => {
    try {
        // Read the SCRAPING_URLS from the environment variable
        const scrapingUrls = process.env.SCRAPING_URLS.split(',');

        // Return the URLs as a JSON response
        console.log('Fetching scraping URLs.');
        res.status(200).json({ urls: scrapingUrls });
    } catch (error) {
        console.error('Error fetching scraping URLs:', error.message, error.stack);
        res.status(500).json({ message: "Failed to fetch scraping URLs", error: error.toString() });
    }
});

module.exports = router;