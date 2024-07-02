const axios = require('axios');
const cheerio = require('cheerio');

// Example function to scrape data from a generic bank's website
async function scrapeBankData(url) {
  try {
    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);
    const loans = [];

    // Replace 'selector-for-loan-items' with actual CSS selector from the target website
    $('actual-selector-for-loan-items').each((index, element) => {
      const loanType = $(element).find('actual-selector-for-loan-type').text().trim();
      const requirements = $(element).find('actual-selector-for-requirements').text().trim();
      const priceTable = $(element).find('actual-selector-for-price-table').html(); // might need further parsing
      const minAmount = $(element).find('actual-selector-for-min-amount').text().trim();
      const maxAmount = $(element).find('actual-selector-for-max-amount').text().trim();
      const minSalary = $(element).find('actual-selector-for-min-salary').text().trim();
      const jobDuration = $(element).find('actual-selector-for-job-duration').text().trim();
      const salaryTransfer = $(element).find('actual-selector-for-salary-transfer').text().trim();

      loans.push({
        loanType,
        requirements,
        priceTable,
        minAmount,
        maxAmount,
        minSalary,
        jobDuration,
        salaryTransfer
      });
    });

    console.log(`Successfully scraped data from ${url}`);
    return loans;
  } catch (error) {
    console.error('Error scraping data from:', url);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    throw new Error(`Failed to scrape data from ${url}`);
  }
}

module.exports = {
  scrapeBankData
};