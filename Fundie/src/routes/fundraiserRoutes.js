const express = require('express');
const Fundraiser = require('../models/fundraiserModel');
const Offer = require('../models/offerModel');
const { showRequestFundForm } = require('../controllers/userController');
const { ensureAuthenticated } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use(ensureAuthenticated);

// Route to show the form for requesting funds
router.get('/request-fund-form', showRequestFundForm);

// Route to create a funding request
router.post('/request-fund', async (req, res) => {
  try {
    const { amount, purpose, documents } = req.body;
    const newFundraiser = new Fundraiser({
      amount,
      purpose,
      documents,
      createdBy: req.session.userId
    });
    await newFundraiser.save();
    console.log('Funding request created successfully');
    res.status(201).send('Funding request created successfully');
  } catch (error) {
    console.error('Error creating funding request:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating funding request', error: error.message });
  }
});

// Route to view status of requests by the fundraiser
router.get('/my-requests', async (req, res) => {
  try {
    const myRequests = await Fundraiser.find({ createdBy: req.session.userId });
    console.log('Funding requests fetched successfully');
    res.json(myRequests);
  } catch (error) {
    console.error('Error fetching funding requests:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching funding requests', error: error.message });
  }
});

// Route to view offers for the fundraiser's requests
router.get('/view-offers', async (req, res) => {
  try {
    const fundraisers = await Fundraiser.find({ createdBy: req.session.userId });
    if (fundraisers.length === 0) {
      console.log('No fundraisers found for user:', req.session.userId);
      res.status(404).json({ message: 'No fundraisers found' });
      return;
    }
    const myOffers = await Offer.find({ 'fundingRequestId': { $in: fundraisers.map(fr => fr._id) } }).populate('fundingRequestId');
    console.log('Offers fetched successfully for user:', req.session.userId);
    res.render('reviewOffers', { offers: myOffers });
  } catch (error) {
    console.error('Error fetching offers:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching offers', error: error.message });
  }
});

// Route to respond to an offer
router.post('/respond-offer/:offerId', async (req, res) => {
  try {
    const { response, reason } = req.body;
    const offerId = req.params.offerId;
    const update = { status: response, rejectionReason: (response === 'reject' ? reason : undefined) };
    await Offer.findByIdAndUpdate(offerId, update);
    console.log('Offer response updated successfully:', response);
    res.redirect('/view-offers');
  } catch (error) {
    console.error('Error responding to offer:', error.message, error.stack);
    res.status(500).json({ message: 'Error responding to offer', error: error.message });
  }
});

module.exports = router;