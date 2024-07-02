const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const InvestmentOpportunity = require('../models/InvestmentOpportunity');
const { log_info, log_error } = require('../utils/logging');
const { isValidUrl } = require('../utils/urlHelpers'); // Utilizing the refactored isValidUrl function
require('dotenv').config();

const processors = {
    'sukuk.sa': processOpportunities,
    'app.lendo.sa': processLendoOpportunitiesWithCredentials // Restored function for handling Lendo with credentials
};

async function scrapeOpportunities() {
    const scrapingURLs = process.env.SCRAPING_URLS.split(',');
    let allOpportunities = [];

    for (const urlString of scrapingURLs) {
        if (!isValidUrl(urlString)) {
            log_error(`Invalid URL skipped: ${urlString}`);
            continue;
        }

        try {
            let opportunities;
            const host = new URL(urlString).hostname;
            if (processors[host]) {
                opportunities = await processors[host](urlString); // Pass urlString directly to the processor
                opportunities = opportunities.map(opportunity => ({ ...opportunity, sourceUrl: urlString })); // Add sourceUrl to each opportunity
            } else {
                log_error(`No processor configured for host: ${host}`);
                continue;
            }

            allOpportunities = allOpportunities.concat(opportunities);
        } catch (error) {
            log_error(`Failed to scrape from URL: ${urlString}`, { error: error.message, stack: error.stack });
        }
    }

    // Store or update opportunities in the database
    for (const opportunity of allOpportunities) {
        try {
            const updateResult = await InvestmentOpportunity.updateOne(
                { opportunityName: opportunity.opportunityName, provider: opportunity.provider },
                opportunity,
                { upsert: true }
            );
            if (updateResult.upsertedCount > 0) {
                log_info(`Inserted new opportunity: ${opportunity.opportunityName}`);
            } else if (updateResult.modifiedCount > 0) {
                log_info(`Updated existing opportunity: ${opportunity.opportunityName}`);
            }
        } catch (error) {
            log_error(`Error updating database for opportunity: ${opportunity.opportunityName}`, { error: error.message, stack: error.stack });
        }
    }

    log_info('Investment opportunities from all providers scraped and stored successfully.');
}

function processOpportunities(data, providerName, sourceUrl) {
    if (!data.opportunities || !data.opportunities.available) {
        log_error('Data structure missing expected properties', { providerName: providerName, sourceUrl: sourceUrl });
        return [];
    }
    return data.opportunities.available.concat(data.opportunities.upcoming || [])
        .map(opportunity => {
            return parseOpportunityValues(opportunity, providerName, sourceUrl);
        });
}

function parseOpportunityValues(opportunity, providerName, sourceUrl) {
    const perSharePrice = parseFloat(opportunity.per_share_price.replace(/,/g, '') || 0);
    const targetAmount = parseFloat(opportunity.opportunity_target_amount.replace(/,/g, '') || 0);
    const roiPercentage = parseFinancialValue(opportunity.opportunity_roi + '');
    const aprPercentage = parseFinancialValue(opportunity.opportunity_apr + '');

    return {
        duration: opportunity.duration,
        opportunityName: opportunity.opportunity_title,
        provider: providerName,
        minimumAmountPerShare: perSharePrice,
        timeToOpen: new Date(opportunity.start_date),
        status: opportunity.opportunity_status_text,
        type: opportunity.opportunity_status_text.includes('متــاحة') ? 'Available' : 'Closed',
        targetAmount: targetAmount,
        ROI: roiPercentage,
        APR: aprPercentage,
        websiteSource: providerName,
        sourceUrl: sourceUrl // Correctly assign sourceUrl based on the actual URL being scraped
    };
}

function parseFinancialValue(value) {
    if (typeof value !== 'string') {
        log_error('Expected string for financial value parsing, received type: ' + typeof value);
        return 0;
    }
    const parsedValue = parseFloat(value.replace(/[^\d.]/g, ''));
    if (isNaN(parsedValue)) {
        log_error('Failed to parse financial value: ' + value);
        return 0;
    }
    return parsedValue;
}

async function processLendoOpportunitiesWithCredentials(urlString) {
    log_info('Starting Lendo scraping with credentials');
    try {
        const browserExecutablePath = process.env.BROWSER_TYPE === 'Edge' ? process.env.EDGE_EXECUTABLE_PATH : process.env.CHROME_EXECUTABLE_PATH;
        if (!browserExecutablePath) {
            log_error('Browser executable path is not set in the environment variables.');
            return;
        }
        const browser = await puppeteer.launch({
            executablePath: browserExecutablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(urlString);
        await page.type('#username', process.env.LENDO_USERNAME);
        await page.type('#password', process.env.LENDO_PASSWORD);
        await page.click('#login-button');
        // Wait for OTP input dynamically from admin panel
        const otp = await new Promise((resolve) => {
            global.eventEmitter.once('otpInput', (inputOtp) => {
                resolve(inputOtp);
            });
        });
        await page.type('#otp', otp);
        await page.click('#otp-submit');
        await page.waitForNavigation();
        const content = await page.content();
        const $ = cheerio.load(content);
        const opportunities = [];
        $('.opportunity').each((i, elem) => {
            const opportunity = {
                duration: $(elem).find('.duration').text(),
                opportunityName: $(elem).find('.name').text(),
                provider: 'Lendo',
                minimumAmountPerShare: parseFloat($(elem).find('.amount').text()),
                timeToOpen: new Date($(elem).find('.date').text()),
                status: $(elem).find('.status').text(),
                type: $(elem).find('.type').text(),
                targetAmount: parseFloat($(elem).find('.target').text()),
                ROI: parseFloat($(elem).find('.roi').text()),
                APR: parseFloat($(elem).find('.apr').text()),
                websiteSource: 'Lendo',
                sourceUrl: urlString
            };
            opportunities.push(opportunity);
        });
        await browser.close();
        return opportunities;
    } catch (error) {
        log_error('Error during Lendo scraping with credentials', { error: error.message, stack: error.stack });
        throw error;
    }
}

module.exports = { scrapeOpportunities };