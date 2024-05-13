const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    fundingRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fundraiser', required: true },
    amountOffered: { type: Number, required: true },
    terms: { type: String, required: true },
    bankDetails: {
        name: { type: String, required: true },
        contactInfo: { type: String, required: true }
    }
});

offerSchema.pre('save', function(next) {
    console.log('Saving new offer from bank:', this.bankDetails.name);
    next();
});

offerSchema.post('save', function(doc) {
    console.log('Offer saved successfully with ID:', doc._id);
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;