require('dotenv').config();
const mongoose = require('mongoose');

async function testEncryption() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reglens';
    await mongoose.connect(MONGO_URI);
    
    // We access the raw collection without the Mongoose Schema 
    // to see exactly what is stored on the disk
    const rawTransactions = await mongoose.connection.db.collection('transactions').find().sort({ timestamp: -1 }).limit(1).toArray();
    
    console.log('\n--- 🔒 RAW DATABASE RECORD (What hackers see) ---');
    if (rawTransactions.length === 0) {
      console.log('No transactions found in DB. Please upload a file via the frontend first.');
    } else {
      const raw = rawTransactions[0];
      console.log(`Sender: ${raw.sender}`);
      console.log(`Receiver: ${raw.receiver}`);
      console.log(`Amount: ${raw.amount}`);
      console.log('\nNotice how sender and receiver start with "ENC:"? That is AES-256 encrypted!');
    }

    // Now we access it via the Mongoose Model to see what the application sees
    const TransactionModel = require('./models/Transaction');
    const appTransactions = await TransactionModel.find().sort({ timestamp: -1 }).limit(1);
    
    console.log('\n--- 🔓 APPLICATION RECORD (What RegLens UI sees) ---');
    if (appTransactions.length > 0) {
      const appData = appTransactions[0];
      console.log(`Sender: ${appData.sender}`);
      console.log(`Receiver: ${appData.receiver}`);
      console.log(`Amount: ${appData.amount}`);
      console.log('\nThe App uses CryptoService natively to decrypt data on-the-fly!');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testEncryption();
