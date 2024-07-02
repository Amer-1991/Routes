const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  loanType: { type: String, required: true },
  requirements: { type: String, required: true },
  priceTable: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  minSalary: { type: Number, required: true },
  jobDuration: { type: Number, required: true }, // assuming job duration is in months or similar unit
  salaryTransfer: { type: Boolean, required: true }
}, { timestamps: true });

// Index for frequently queried fields
loanSchema.index({ minAmount: 1, maxAmount: 1, minSalary: 1 });

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;