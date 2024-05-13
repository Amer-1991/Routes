const { Router } = require('express');
const { ensureAuthenticated, checkRole } = require('../../middlewares/authMiddleware');
const Offer = require('../models/offerModel');

const router = Router();

// Route to view open funding requests
router.get('/view-requests', ensureAuthenticated, checkRole('bank'), async (req, res) => {
    try {
        // Implementation to fetch open requests should go here
        console.log('Fetching open funding requests for bank');
        res.send('Displaying open funding requests');
    } catch (error) {
        console.error('Failed to fetch open funding requests:', error.message, error.stack);
        res.status(500).send('Error fetching open funding requests');
    }
});

// Route for banks to submit an offer to a request
router.post('/submit-offer', ensureAuthenticated, checkRole('bank'), async (req, res) => {
    const { fundingRequestId, amountOffered, terms, bankDetails } = req.body;
    try {
        const newOffer = new Offer({ fundingRequestId, amountOffered, terms, bankDetails });
        await newOffer.save();
        console.log('Offer submitted successfully by bank:', bankDetails.name);
        res.send('Offer submitted successfully');
    } catch (error) {
        console.error('Error submitting offer:', error.message, error.stack);
        res.status(500).send('Error submitting offer');
    }
});

// Route for banks to view the status of their offers
router.get('/status-offers', ensureAuthenticated, checkRole('bank'), async (req, res) => {
    try {
        // Implementation to fetch offer status should go here
        console.log('Fetching status of offers submitted by the bank');
        res.send('Displaying status of offers submitted by the bank');
    } catch (error) {
        console.error('Failed to fetch status of offers:', error.message, error.stack);
        res.status(500).send('Error fetching status of offers');
    }
});

// Route to view rejected offers for the bank
router.get('/rejected-offers', ensureAuthenticated, checkRole('bank'), async (req, res) => {
    try {
        // Fetch only those offers that were rejected and belong to the logged-in bank
        const rejectedOffers = await Offer.find({ 'bankDetails.name': req.session.bankName, status: 'rejected' });
        res.render('bank/rejectedOffers', { offers: rejectedOffers });
    } catch (error) {
        console.error('Failed to fetch rejected offers:', error.message, error.stack);
        res.status(500).send('Error fetching rejected offers');
    }
});

// Route for banks to update an offer
router.post('/update-offer/:offerId', ensureAuthenticated, checkRole('bank'), async (req, res) => {
    const { amountOffered, terms } = req.body;
    try {
        const offer = await Offer.findOneAndUpdate(
            { _id: req.params.offerId, 'bankDetails.name': req.session.bankName },
            { amountOffered, terms, status: 'updated' },
            { new: true }
        );
        if (!offer) {
            return res.status(404).send('Offer not found or you do not have permission to update it');
        }
        console.log('Offer updated successfully:', offer._id);
        res.send('Offer updated successfully');
    } catch (error) {
        console.error('Error updating offer:', error.message, error.stack);
        res.status(500).send('Error updating offer');
    }
});

module.exports = router;