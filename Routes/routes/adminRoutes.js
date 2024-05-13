const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../routes/middleware/authMiddleware');
const { scrapeOpportunities } = require('../utils/scrapeOpportunities');

router.post('/scrape', isAuthenticated, async (req, res) => {
    try {
        await scrapeOpportunities();
        console.log('Scraping process initiated and completed successfully.');
        res.send('Scraping process completed successfully.');
    } catch (error) {
        console.error('Failed to initiate scraping process:', error.message, error.stack);
        res.status(500).send('Failed to initiate scraping process.');
    }
});

// Adding a GET route for manual scraping
router.get('/scrape', isAuthenticated, async (req, res) => {
    try {
        await scrapeOpportunities();
        console.log('Manual scraping process initiated and completed successfully.');
        res.send('Manual scraping process completed successfully.');
    } catch (error) {
        console.error('Failed to manually initiate scraping process:', error.message, error.stack);
        res.status(500).send('Failed to manually initiate scraping process.');
    }
});

module.exports = router;