const { exec } = require('child_process');
const InvestmentOpportunity = require('../models/InvestmentOpportunity');

async function scrapeOpportunities() {
    exec('python3 ./utils/pythonScrapeOpportunities.py', async (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing Python scraping script:', error.message, error.stack);
            return;
        }
        if (stderr) {
            console.error('Error output from Python scraping script:', stderr);
            return;
        }
        try {
            const opportunities = JSON.parse(stdout);
            if (opportunities.length === 0) {
                console.log('No opportunities found from Python script.');
            } else {
                await InvestmentOpportunity.insertMany(opportunities);
                console.log('Investment opportunities scraped and stored successfully.');
            }
        } catch (parseError) {
            console.error('Failed to parse opportunities data:', parseError.message, parseError.stack);
        }
    });
}

module.exports = { scrapeOpportunities };