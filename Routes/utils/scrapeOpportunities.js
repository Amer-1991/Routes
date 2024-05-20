const axios = require('axios');
const cheerio = require('cheerio');
const InvestmentOpportunity = require('../models/InvestmentOpportunity');
const { log_info, log_error } = require('../utils/logging');

async function scrapeOpportunities() {
    try {
        const headers = {};

        // Fetch opportunities from the original source
        const sukukData = await axios.get('https://sukuk.sa/api/homepageOpportunities', { headers });
        if (!sukukData.data || !sukukData.data.opportunities) {
            log_error('No opportunities data found in the response from Sukuk');
            throw new Error('No opportunities data found in the response from Sukuk');
        }

        const sukukOpportunities = processOpportunities(sukukData.data, 'Sukuk');

        // Fetch opportunities from Lendo
        const lendoResponse = await axios.get('https://app.lendo.sa/investor/invest');
        if (!lendoResponse.data) {
            log_error('No data found in the response from Lendo');
            throw new Error('No data found in the response from Lendo');
        }
        const lendoOpportunities = processLendoOpportunities(lendoResponse.data);

        // Combine opportunities from both providers
        const allOpportunities = sukukOpportunities.concat(lendoOpportunities);

        if (allOpportunities.length === 0) {
            log_info('No opportunities found after processing from both providers.');
            return;
        }

        // Store or update opportunities in the database
        for (const opportunity of allOpportunities) {
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
        }

        log_info('Investment opportunities from all providers scraped and stored successfully.');
    } catch (error) {
        log_error('Failed to scrape investment opportunities', { error: error.message, stack: error.stack });
    }
}

function processOpportunities(data, providerName) {
    return data.opportunities.available.concat(data.opportunities.upcoming)
        .map(opportunity => {
            return parseOpportunityValues(opportunity, providerName);
        });
}

function parseOpportunityValues(opportunity, providerName) {
    const perSharePrice = opportunity.per_share_price ? parseFloat(opportunity.per_share_price.replace(/,/g, '')) : 0;
    const targetAmount = opportunity.opportunity_target_amount ? parseFloat(opportunity.opportunity_target_amount.replace(/,/g, '')) : 0;
    const roiPercentage = typeof opportunity.opportunity_roi === 'string' ? parseFloat(opportunity.opportunity_roi.replace(/[^\d.]/g, '')) : 0;
    const aprPercentage = typeof opportunity.opportunity_apr === 'string' ? parseFloat(opportunity.opportunity_apr.replace(/[^\d.]/g, '')) : 0;

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
        websiteSource: providerName
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

function processLendoOpportunities(htmlData) {
    const $ = cheerio.load(htmlData);
    const opportunities = [];
    $('.opportunity-class').each((i, elem) => {
        const opportunity = {
            duration: $(elem).find('.duration-selector').text(),
            opportunityName: $(elem).find('.name-selector').text(),
            provider: 'Lendo',
            minimumAmountPerShare: parseFloat($(elem).find('.amount-selector').text().replace(/,/g, '')),
            timeToOpen: new Date($(elem).find('.date-selector').text()),
            status: $(elem).find('.status-selector').text(),
            type: $(elem).find('.type-selector').text(),
            targetAmount: parseFloat($(elem).find('.target-selector').text().replace(/,/g, '')),
            ROI: parseFloat($(elem).find('.roi-selector').text().replace('%', '')),
            APR: parseFloat($(elem).find('.apr-selector').text().replace('%', '')),
            websiteSource: 'Lendo'
        };
        opportunities.push(opportunity);
    });
    return opportunities;
}

module.exports = { scrapeOpportunities };