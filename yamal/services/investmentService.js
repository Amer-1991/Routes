const axios = require('axios');

const fetchInvestmentOpportunities = async () => {
  try {
    const response = await axios.get('https://api.externalwebsite.com/opportunities');
    return response.data;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('Network error: Unable to reach the API. Check the network connection or the API URL.');
    } else {
      console.error('Failed to fetch investment opportunities:', error);
    }
    throw error;
  }
};

module.exports = {
  fetchInvestmentOpportunities
};