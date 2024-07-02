const cron = require('node-cron');
const { scrapeOpportunities } = require('./scrapeOpportunities');
const { PythonShell } = require('python-shell');
const { mergeData } = require('./dataMerger'); // Assuming a dataMerger utility for merging data

function scheduleScrapingTask() {
    // Schedule the scraping to run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Starting scheduled scraping of investment opportunities from both websites...');
        let originalData = [];
        try {
            originalData = await scrapeOpportunities(); // Scraping from the original website
            console.log('Scraping from the original website completed successfully.');
        } catch (error) {
            console.error('Error during scraping from the original website:', error.message);
            console.error('Error stack:', error.stack);
        }

        // Scraping from the new website using PythonShell to execute Python script
        PythonShell.run('pythonScraper.py', { scriptPath: './utils/' }, async (err, results) => {
            if (err) {
                console.error('Error during Python scraping:', err.message);
                console.error('Error stack:', err.stack);
            } else {
                console.log('Scraping from the new website completed successfully.');
                console.log('Results from Python scraping:', results);
                try {
                    const newData = JSON.parse(results[0]); // Assuming results are returned as an array of JSON strings
                    const mergedData = await mergeData(originalData, newData);
                    console.log('Data merged successfully.');
                } catch (parseError) {
                    console.error('Error parsing results from new website:', parseError.message);
                    console.error('Error stack:', parseError.stack);
                }
            }
        });

        console.log('All scheduled scraping tasks completed successfully.');
    }, {
        scheduled: true,
        timezone: "Asia/Riyadh"
    });
}

module.exports = { scheduleScrapingTask };