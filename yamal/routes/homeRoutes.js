const express = require('express');
const { fetchInvestmentOpportunities } = require('../services/investmentService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const opportunities = await fetchInvestmentOpportunities();
    res.render('index', { opportunities });
  } catch (error) {
    console.error(`Failed to load investment opportunities: ${error.message}`);
    console.error(error.stack);
    res.status(500).send("Failed to load investment opportunities.");
  }
});

module.exports = router;