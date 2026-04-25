const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  country: { type: String, required: true },
  transactionType: { type: String, required: true },
  description: { type: String, default: '' },
  senderCountry: { type: String },
  receiverCountry: { type: String },
  
  // Scoring / Risk fields
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  isFlagged: { type: Boolean, default: false },
  riskReasons: [{ type: String }],
  flagged: { type: Boolean, default: false }, // legacy
  triggeredRules: [{ type: String }], // legacy
  
  // Insights
  aiExplanation: { type: String },
  analystNote: { type: String },
  
  // Metadata
  sourceFormat: { type: String, default: 'CSV' },
  rawSourceReference: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
