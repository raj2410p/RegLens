const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { rateLimit } = require('express-rate-limit');
require('dotenv').config();

// Rate limiter: max 20 AI queries per IP per hour
const queryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Query limit reached. You can send up to 20 AI queries per hour. Please try again later.',
    retryAfter: '1 hour'
  }
});

const Transaction = require('./models/Transaction');
const ParserService = require('./services/ParserService');
const RiskEngine = require('./services/RiskEngine');
const LlmService = require('./services/LlmService');
const PrivacyService = require('./services/PrivacyService');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const llm = new LlmService(); // reads GEMINI_API_KEY from .env
const privacy = new PrivacyService();

// Middleware
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes

/**
 * Upload and process files (CSV, JSON, XML,pdf)
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filename = req.file.originalname.toLowerCase();
    let normalizedData = [];

    if (filename.endsWith('.csv')) {
      normalizedData = ParserService.parseCSV(req.file.buffer);
    } else if (filename.endsWith('.json')) {
      normalizedData = ParserService.parseJSON(req.file.buffer);
    } else if (filename.endsWith('.xml')) {
      normalizedData = await ParserService.parseXML(req.file.buffer);
    } else if (filename.endsWith('.pdf')) {
      normalizedData = await ParserService.parsePDF(req.file.buffer, llm);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please use CSV, JSON, XML, or PDF.' });
    }

    const processedTransactions = [];
    
    // 1. Initial save with Risk Engine results (Fast)
    for (const data of normalizedData) {
      const history = await Transaction.find({ sender: data.sender }).sort({ timestamp: -1 }).limit(20);
      const riskResults = await RiskEngine.evaluate(data, history);
      const tx = new Transaction({ ...data, ...riskResults });
      const saved = await tx.save();
      processedTransactions.push(saved);
    }

    // 2. Respond immediately to avoid Heroku 30s timeout
    res.json({
      message: `Successfully received ${processedTransactions.length} transactions. AI risk analysis is running in the background. Refresh in a few moments to see full details.`,
      count: processedTransactions.length
    });

    // 3. Process AI Narratives in the background (Slow)
    // We do this after the response is sent.
    setImmediate(async () => {
      console.log(`[Background] Starting AI analysis for ${processedTransactions.length} records...`);
      const backgroundPrivacy = new PrivacyService(); // Fresh instance to avoid state collision
      
      for (const tx of processedTransactions) {
        try {
          const anonymizedTxData = {
            ...tx.toObject(),
            sender: backgroundPrivacy.tokenize(tx.sender),
            receiver: backgroundPrivacy.tokenize(tx.receiver)
          };

          const rawAiExplanation = await llm.explainTransaction(anonymizedTxData);
          const aiExplanation = backgroundPrivacy.detokenize(rawAiExplanation);

          await Transaction.findByIdAndUpdate(tx._id, { aiExplanation });
        } catch (err) {
          console.error(`[Background Error] AI analysis failed for TX ${tx.transactionId}:`, err.message);
        }
      }
      console.log(`[Background] AI analysis complete.`);
    });

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process file: ' + err.message });
    }
  }
});

/**
 * Get all transactions with filtering
 */
app.get('/api/transactions', async (req, res) => {
  try {
    const { riskLevel, flagged, search } = req.query;
    let query = {};

    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = riskLevel;
    }
    if (flagged === 'true') {
      query.$or = [{ flagged: true }, { isFlagged: true }];
    }
    if (search) {
      query.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { receiver: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * Clear all transactions
 */
app.delete('/api/transactions', async (req, res) => {
  try {
    const result = await Transaction.deleteMany({});
    res.json({ 
      message: `Successfully cleared ${result.deletedCount} transactions.`,
      count: result.deletedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear transactions' });
  }
});

/**
 * Get single transaction
 */
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get dashboard summary stats
 */
app.get('/api/summary', async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const flagged = await Transaction.countDocuments({ $or: [{ flagged: true }, { isFlagged: true }] });
    const highRisk = await Transaction.countDocuments({ riskLevel: 'HIGH' });
    const mediumRisk = await Transaction.countDocuments({ riskLevel: 'MEDIUM' });
    const lowRisk = await Transaction.countDocuments({ riskLevel: 'LOW' });

    // Calculate total flagged amount
    const flaggedRecords = await Transaction.find({ $or: [{ flagged: true }, { isFlagged: true }] });
    const totalFlaggedAmount = flaggedRecords.reduce((sum, tx) => sum + tx.amount, 0);

    // Recent patterns (simplified)
    const recentFlagged = await Transaction.find({ $or: [{ flagged: true }, { isFlagged: true }] }).sort({ timestamp: -1 }).limit(5);

    res.json({
      total: Number(total) || 0,
      flagged: Number(flagged) || 0,
      highRisk: Number(highRisk) || 0,
      mediumRisk: Number(mediumRisk) || 0,
      lowRisk: Number(lowRisk) || 0,
      totalFlaggedAmount,
      recentFlagged
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * Generate full audit report data
 */
app.get('/api/report', async (req, res) => {
  try {
    const total = await Transaction.countDocuments();
    const flagged = await Transaction.countDocuments({ flagged: true });
    
    // Group triggered rules to find most common risks
    const transactions = await Transaction.find({ flagged: true }).select('triggeredRules riskLevel');
    const riskCounts = {};
    transactions.forEach(tx => {
      tx.triggeredRules.forEach(rule => {
        const baseRule = rule.split(':')[0];
        riskCounts[baseRule] = (riskCounts[baseRule] || 0) + 1;
      });
    });

    const topRisks = Object.entries(riskCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const highRiskAlerts = await Transaction.find({ riskLevel: 'HIGH' })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('transactionId sender receiver amount currency triggeredRules');

    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalTransactions: total,
        flaggedTransactions: flagged,
        flagRate: total > 0 ? ((flagged / total) * 100).toFixed(1) + '%' : '0%'
      },
      topRiskPatterns: topRisks,
      criticalAlerts: highRiskAlerts
    });
  } catch (err) {
    console.error('[Report API Error]', err);
    res.status(500).json({ error: 'Failed to generate report data: ' + err.message });
  }
});

/**
 * Natural Language Query
 */
/**
 * AI Query — rate limited, passes real transaction data as context
 */
app.post('/api/query', queryLimiter, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) return res.status(400).json({ error: 'Query is empty.' });

    // Fetch the actual transaction records to give Gemini real context
    // We cannot use .lean() here because we need the Mongoose getters to decrypt the fields!
    const dbTransactions = await Transaction.find({}).sort({ timestamp: -1 }).limit(50);
    const transactions = dbTransactions.map(doc => doc.toObject());
    
    // Anonymize transactions

    privacy.clear();
    const anonymizedTransactions = transactions.map(tx => ({
      ...tx,
      sender: privacy.tokenize(tx.sender),
      receiver: privacy.tokenize(tx.receiver)
    }));

    // We don't tokenize the full query string because that would replace the whole sentence with "Entity_X"
    // and Gemini/mockQuery won't understand "show high risk" anymore.
    const response = await llm.parseQuery(query, anonymizedTransactions);
    
    // Detokenize the AI response
    if (response && response.message) {
      response.message = privacy.detokenize(response.message);
    }

    res.json(response);
  } catch (err) {
    console.error('[Query]', err.message);
    res.status(500).json({ error: 'Query failed: ' + err.message });
  }
});

/**
 * Update analyst note
 */
app.patch('/api/transactions/:id/note', async (req, res) => {
  try {
    const { note } = req.body;
    const tx = await Transaction.findByIdAndUpdate(req.params.id, { analystNote: note }, { new: true });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Database connection & Start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reglens';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
