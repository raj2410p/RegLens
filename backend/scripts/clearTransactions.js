/**
 * One-time script to clear all stored transactions so they can be
 * re-uploaded with real Gemini-generated AI explanations.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reglens';

mongoose.connect(MONGO_URI).then(async () => {
  const result = await mongoose.connection.collection('transactions').deleteMany({});
  console.log(`✓ Cleared ${result.deletedCount} transactions from the database.`);
  console.log('  Now re-upload your CSV via the dashboard to get real Gemini explanations.');
  process.exit(0);
}).catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});
