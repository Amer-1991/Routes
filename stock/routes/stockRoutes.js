const axios = require('axios');
const express = require('express');
const router = express.Router();
const { mean, exp, add, divide, std } = require('mathjs');
const StockData = require('../models/StockData'); // Import the StockData model
const { externalPredictionMethod } = require('./externalPredictionMethods'); // Import external prediction methods

// Function to fetch data from Alpha Vantage API
async function fetchDataFromAPI(url) {
    try {
        console.log(`Fetching data from API: ${url}`);
        const response = await axios.get(url);
        const data = response.data;

        if (data['Error Message']) {
            console.error(`Error from Alpha Vantage API: ${data['Error Message']}`);
            throw new Error(`API Error: ${data['Error Message']}`);
        }

        if (data['Note']) {
            console.error(`API limit reached: ${data['Note']}`);
            throw new Error('API call limit reached. Please try again later.');
        }

        return data;
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Function to fetch historical data from Alpha Vantage API
async function fetchHistoricalData(stockSymbol, startDate, endDate) {
    // Validate input dates
    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        console.error(`Invalid date values provided: startDate=${startDate}, endDate=${endDate}`);
        throw new Error('Invalid date values. Please provide valid dates.');
    }

    // Convert dates to appropriate format for caching and comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cacheKey = `${stockSymbol}_${start.toISOString()}_${end.toISOString()}`;

    // Check cache first
    const cachedData = await StockData.findOne({ symbol: cacheKey });
    if (cachedData && new Date(cachedData.updatedAt) > new Date(new Date().setDate(new Date().getDate() - 7))) {
        console.log(`Using cached data for ${stockSymbol}`);
        return cachedData.historicalData;
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        console.error('API key for Alpha Vantage is not set in environment variables.');
        throw new Error('API key not set');
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&outputsize=full&apikey=${apiKey}`;
    const data = await fetchDataFromAPI(url);

    if (!data['Time Series (Daily)']) {
        console.error(`Expected data not found in API response for stock symbol: ${stockSymbol}`);
        throw new Error('API response does not contain expected data structure.');
    }

    const historicalData = data['Time Series (Daily)'];
    const predictions = await predictStockPrices(historicalData, stockSymbol);

    // Update cache
    const update = { historicalData, predictions, updatedAt: new Date() };
    const options = { upsert: true, new: true };
    await StockData.findOneAndUpdate({ symbol: cacheKey }, update, options);

    console.log(`Data fetched successfully for stock symbol: ${stockSymbol}`);
    return historicalData;
}

// Calculate moving average
function movingAverage(data, period) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += data[i];
    }
    return sum / period;
}

// Calculate exponential smoothing
function exponentialSmoothing(data, alpha) {
    let result = data[0]; // Starting point
    for (let i = 1; i < data.length; i++) {
        result = alpha * data[i] + (1 - alpha) * result;
    }
    return result;
}

// Predict stock prices using historical data
async function predictStockPrices(historicalData, stockSymbol) {
    try {
        const prices = Object.values(historicalData).map(entry => parseFloat(entry['4. close']));
        const predictions = {};

        // Adjusting exponential smoothing factor based on recent volatility
        const recentPrices = prices.slice(0, 30);
        const volatility = std(recentPrices);
        const alpha = Math.min(0.5, 1 / volatility); // Dynamic alpha based on volatility

        // Predict next day using exponential smoothing
        predictions.nextDay = exponentialSmoothing(prices, alpha);

        // Predict next week using moving average of the last 7 days
        predictions.nextWeek = movingAverage(prices.slice(0, 7), 7);

        // Predict next month using moving average of the last 30 days
        predictions.nextMonth = movingAverage(prices.slice(0, 30), 30);

        console.log(`Predictions made for stock symbol: ${stockSymbol}`);
        return predictions;
    } catch (error) {
        console.error('Error predicting stock prices:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// POST route handler for predicting stock prices
router.post('/predict', async (req, res) => {
    const stockSymbol = req.body.stockSymbol;
    const predictionMethod = req.body.predictionMethod || 'Exponential Smoothing'; // Set default method if not provided
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    // Validate date inputs
    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        console.error(`Invalid or missing date values: startDate=${startDate}, endDate=${endDate}`);
        return res.status(400).json({ error: 'Valid startDate and endDate are required' });
    }

    if (!stockSymbol) {
        console.error('No stock symbol provided in the request.');
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        console.log(`Received prediction request for stock symbol: ${stockSymbol} using method: ${predictionMethod}`);
        const historicalData = await fetchHistoricalData(stockSymbol, startDate, endDate);
        const prices = Object.values(historicalData).map(entry => parseFloat(entry['4. close']));

        let predictions;
        switch (predictionMethod) {
            case 'Moving Average':
                predictions = { nextDay: movingAverage(prices, 1), nextWeek: movingAverage(prices, 7), nextMonth: movingAverage(prices, 30) };
                break;
            case 'Exponential Smoothing':
                predictions = { nextDay: exponentialSmoothing(prices, 0.5) }; // Example alpha value
                break;
            case 'External Method':
                predictions = await externalPredictionMethod(prices); // Use external prediction method
                break;
            default:
                predictions = await predictStockPrices(historicalData, stockSymbol);
                break;
        }

        res.json({
            stockSymbol: stockSymbol,
            predictions: predictions
        });
    } catch (error) {
        console.error('Error in /predict route:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: error.message });
    }
});

// New endpoint to compare predictions with real-time price
router.get('/compare', async (req, res) => {
    const stockSymbol = req.query.stockSymbol;
    if (!stockSymbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
        const data = await fetchDataFromAPI(url);

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
            const realTimePrice = parseFloat(data['Global Quote']['05. price']);
            res.json({ realTimePrice });
        } else {
            console.error('Real-time price data not available or incomplete for:', stockSymbol);
            res.status(404).json({ error: 'Real-time price data not available or incomplete.' });
        }
    } catch (error) {
        console.error('Error fetching real-time price:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to fetch real-time price' });
    }
});

module.exports = router;