const { PDFParse } = require('pdf-parse');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reglens');
    console.log('Connected to MongoDB');

    const total = await Transaction.countDocuments();
    const flagged = await Transaction.countDocuments({ $or: [{ flagged: true }, { isFlagged: true }] });
    const high = await Transaction.countDocuments({ riskLevel: 'HIGH' });
    const med = await Transaction.countDocuments({ riskLevel: 'MEDIUM' });
    const low = await Transaction.countDocuments({ riskLevel: 'LOW' });

    console.log('--- Statistics ---');
    console.log('Total Records:', total);
    console.log('Flagged:', flagged);
    console.log('High Risk:', high);
    console.log('Medium Risk:', med);
    console.log('Low Risk:', low);

    const samples = await Transaction.find().sort({ timestamp: -1 }).limit(3);
    console.log('\n--- Samples ---');
    samples.forEach((s, i) => {
      console.log(`\nSample ${i + 1}:`);
      console.log(`  ID: ${s.transactionId}`);
      console.log(`  Amount: ${s.amount} ${s.currency}`);
      console.log(`  Country: ${s.country}`);
      console.log(`  RiskLevel: ${s.riskLevel}`);
      console.log(`  IsFlagged: ${s.isFlagged || s.flagged}`);
      console.log(`  Reasons: ${JSON.stringify(s.triggeredRules || s.riskReasons)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
