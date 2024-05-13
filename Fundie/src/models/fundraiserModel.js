const mongoose = require('mongoose');

const fundraiserSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  documents: [{ type: String, required: true }],
  status: { type: String, required: true, default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }]
});

fundraiserSchema.pre('save', function(next) {
  console.log('Saving new fundraiser with purpose:', this.purpose);
  next();
});

fundraiserSchema.post('save', function(doc, next) {
  console.log('Fundraiser saved successfully with ID:', doc._id);
  next();
});

fundraiserSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving fundraiser:', error.message, error);
    next(error);
  } else {
    next();
  }
});

const Fundraiser = mongoose.model('Fundraiser', fundraiserSchema);

module.exports = Fundraiser;