const mongoose = require('mongoose');
const logger = require('../utils/logging');

const investmentOpportunitySchema = new mongoose.Schema({
  duration: { type: String, required: true },
  opportunityName: { type: String, required: true },
  provider: { type: String, required: true },
  minimumAmountPerShare: { type: Number, required: true },
  timeToOpen: { type: Date, required: true },
  status: { type: String, required: true },
  type: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  ROI: { type: Number, required: true },
  APR: { type: Number, required: true },
  websiteSource: { type: String, required: true },
  additionalAttributes: { type: Map, of: String },
  sourceUrl: { type: String, required: true },  // Field to track the URL of the scraped data
  uniqueInvestmentIdentifier: { type: String, required: false },
  newInvestmentTerm: { type: String, required: false }
});

investmentOpportunitySchema.pre('save', function(next) {
  logger.debug('Attempting to save investment opportunity data');
  next();
});

investmentOpportunitySchema.post('save', function(error, doc, next) {
  if (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      logger.error('Duplicate key error', { errorMessage: error.message, stack: error.stack });
      next(new Error('There was a duplicate key error'));
    } else {
      logger.error('Error saving investment opportunity', { errorMessage: error.message, stack: error.stack });
      next(error);
    }
  } else {
    logger.debug(`Investment opportunity with ID ${doc._id} saved successfully`);
    next();
  }
});

const InvestmentOpportunity = mongoose.model('InvestmentOpportunity', investmentOpportunitySchema);

module.exports = InvestmentOpportunity;