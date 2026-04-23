const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reglens');
  const txs = await Transaction.find({}).limit(10);
  console.log('Sample Transactions:');
  txs.forEach(t => {
    console.log(`ID: ${t.transactionId}, Flagged: ${t.flagged}, AI Explanation Length: ${t.aiExplanation?.length || 0}`);
    if (!t.aiExplanation) {
      console.log('  --- EMPTY EXPLANATION ---');
    }
  });
  process.exit();
}
check();
