// This file contains external prediction methods adapted from the cloned repository
// and integrated into the current project's prediction system.

const { exp, add, divide, std } = require('mathjs');

// Helper function to parse stock prices from stock data
function parseStockPrices(stockData) {
    return stockData.map(data => parseFloat(data['4. close']));
}

// Original simple average prediction method
async function simpleAveragePredictionMethod(stockData) {
    try {
        console.log("Starting simple average prediction method with provided stock data.");
        const prices = parseStockPrices(stockData);
        let sum = 0;
        for (let i = 0; i < prices.length; i++) {
            sum += prices[i];
        }
        const prediction = sum / prices.length;
        console.log("Prediction calculated using simple average method:", prediction);
        return prediction;
    } catch (error) {
        console.error("Error in simple average prediction method:", error.message);
        console.error(error.stack);
        throw error;
    }
}

// Function adapted to utilize weighted averages and volatility
async function weightedVolatilityPredictionMethod(stockData, weightFactor = 0.1, volatilityPeriod = 5) {
    try {
        console.log("Starting weighted volatility prediction method with provided stock data.");
        const prices = parseStockPrices(stockData);

        // Calculate weighted average
        let weightedSum = 0, weightSum = 0;
        for (let i = 0; i < prices.length; i++) {
            let weight = exp(-weightFactor * (prices.length - i - 1));
            weightedSum += weight * prices[i];
            weightSum += weight;
        }
        const weightedAverage = divide(weightedSum, weightSum);

        // Calculate volatility
        const recentPrices = prices.slice(-volatilityPeriod);
        const volatility = std(recentPrices);

        // Combine weighted average and volatility
        const prediction = add(weightedAverage, volatility);

        console.log("Prediction calculated using weighted volatility method:", prediction);
        return prediction;
    } catch (error) {
        console.error("Error in weighted volatility prediction method:", error.message);
        console.error(error.stack);
        throw error;
    }
}

module.exports = {
    simpleAveragePredictionMethod,
    weightedVolatilityPredictionMethod
};