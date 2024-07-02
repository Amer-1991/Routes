const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  historicalData: { type: mongoose.Schema.Types.Mixed, required: true },
  predictions: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now } // to manage data freshness
});

module.exports = mongoose.model('StockData', stockDataSchema);