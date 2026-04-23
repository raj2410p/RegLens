/**
 * LLM Explanation Service — Google Gemini Integration
 *
 * Two capabilities:
 *  1. explainTransaction(tx)  — compliance narrative for every transaction
 *  2. parseQuery(query, txs)  — real Gemini NL query over actual transaction data
 *
 * mockExplanation / mockQuery are fallbacks ONLY when API key is missing.
 */

const { GoogleGenAI } = require('@google/genai');

class LlmService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.useMock = !apiKey || apiKey === 'MOCK';

    if (!this.useMock) {
      // @google/genai standard implementation
      this.ai = new GoogleGenAI(apiKey);
      this.modelName = 'gemini-1.5-flash'; // Optimized for speed/cost in compliance workflows
      console.log(`[LlmService] ✓ Gemini AI initialized (${this.modelName})`);
    } else {
      console.warn('[LlmService] ⚠ No API key — using mock fallback');
    }
  }

  async _generate(prompt) {
    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text()?.trim() || '';
    } catch (err) {
      throw err;
    }
  }

  /* ──────────────────────────────────────────
     1. TRANSACTION EXPLANATION
        Generates a compliance narrative for
        every transaction (all risk levels).
  ────────────────────────────────────────── */
  buildExplainPrompt(tx) {
    return `
You are a financial compliance analyst at a European investment bank.
Write a concise 2–3 sentence compliance narrative for this transaction.
Cover: what the transaction is, whether the pattern is concerning or routine, and a brief analyst recommendation.
Use precise financial language. Never call a transaction "definitely fraud" — frame everything as probability or recommendation.

Transaction:
  ID       : ${tx.transactionId}
  Sender   : ${tx.sender}
  Receiver : ${tx.receiver}
  Amount   : ${tx.amount} ${tx.currency}
  Country  : ${tx.country}
  Type     : ${tx.transactionType}
  Risk     : ${tx.riskLevel} (score ${tx.riskScore}/100)
  Flagged  : ${tx.flagged ? 'Yes' : 'No'}
  Rules    : ${tx.triggeredRules?.join('; ') || 'None'}

Write the narrative now (no bullet points, plain prose):
`.trim();
  }

  async explainTransaction(tx) {
    if (this.useMock) return this.mockExplanation(tx);
    try {
      const text = await this._generate(this.buildExplainPrompt(tx));
      return text || this.mockExplanation(tx);
    } catch (err) {
      console.error('[LlmService] explain failed:', err.message);
      return this.mockExplanation(tx);
    }
  }

  /* ──────────────────────────────────────────
     2. REAL NATURAL LANGUAGE QUERY
        Sends actual transaction records as
        context so Gemini can answer anything:
        "who sent the most?", "any North Korea?",
        "summarize suspicious patterns today"
  ────────────────────────────────────────── */
  buildQueryPrompt(userQuery, transactions) {
    // Send a compact JSON snapshot of transactions to keep token count low
    const txSummary = transactions.slice(0, 50).map(tx => ({
      id:        tx.transactionId,
      sender:    tx.sender,
      receiver:  tx.receiver,
      amount:    tx.amount,
      currency:  tx.currency,
      country:   tx.country,
      type:      tx.transactionType,
      risk:      tx.riskLevel,
      score:     tx.riskScore,
      flagged:   tx.flagged,
      rules:     tx.triggeredRules,
    }));

    return `
You are a compliance data assistant for a financial transaction monitoring system.
Below is a JSON array of the current transaction ledger (up to 50 records).

Transaction Data:
${JSON.stringify(txSummary, null, 2)}

User Question: "${userQuery}"

Instructions:
- Answer the user's question using only the data provided above.
- Be factual, concise, and professional (2–4 sentences max).
- If the question asks to filter/show a specific risk level, include the riskLevel in your JSON response.
- Respond with ONLY a valid JSON object (no markdown, no code fences):
  {
    "intent": "FILTER" | "SUMMARY" | "EXPLAIN" | "GENERAL",
    "riskLevel": "HIGH" | "MEDIUM" | "LOW" | null,
    "message": "your answer here"
  }
`.trim();
  }

  /**
   * parseQuery — uses real Gemini with transaction context
   * @param {string} query  — the user's natural language question
   * @param {Array}  transactions — actual records from the DB
   */
  async parseQuery(query, transactions) {
    if (this.useMock) return this.mockQuery(query, transactions);

    try {
      const raw = await this._generate(this.buildQueryPrompt(query, transactions));
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        intent:  parsed.intent  || 'GENERAL',
        message: parsed.message || 'No response generated.',
        ...(parsed.riskLevel ? { filters: { riskLevel: parsed.riskLevel } } : {}),
      };
    } catch (err) {
      console.error('[LlmService] query failed:', err.message);
      return this.mockQuery(query, transactions);
    }
  }

  /* ──────────────────────────────────────────
     MOCK FALLBACKS (used only when no API key)
  ────────────────────────────────────────── */
  mockExplanation(tx) {
    if (tx.riskLevel === 'LOW' && !tx.flagged) {
      return `Transaction ${tx.transactionId} from ${tx.sender} to ${tx.receiver} for ${tx.currency} ${tx.amount} appears routine with no suspicious indicators. No analyst action required at this time.`;
    }
    const parts = [`Transaction ${tx.transactionId} was assessed as ${tx.riskLevel} risk (score: ${tx.riskScore}/100).`];
    if (tx.triggeredRules?.some(r => r.includes('THRESHOLD'))) parts.push(`The amount is near the $10,000 AML threshold, which may indicate structuring.`);
    if (tx.triggeredRules?.some(r => r.includes('GEO')))       parts.push(`The jurisdiction (${tx.country}) requires enhanced due diligence.`);
    if (tx.triggeredRules?.some(r => r.includes('VELOCITY'))) parts.push(`Repeated transfers to the same receiver suggest possible layering activity.`);
    parts.push('Analyst should verify source of funds before clearing.');
    return parts.join(' ');
  }

  mockQuery(query, transactions) {
    const q = query.toLowerCase();
    const total   = transactions.length;
    const flagged = transactions.filter(t => t.flagged).length;
    const high    = transactions.filter(t => t.riskLevel === 'HIGH').length;

    if (q.includes('high'))    return { intent: 'FILTER', filters: { riskLevel: 'HIGH' }, message: `Showing ${high} high-risk transactions that require urgent review.` };
    if (q.includes('medium'))  return { intent: 'FILTER', filters: { riskLevel: 'MEDIUM' }, message: `Showing medium-risk transactions for secondary review.` };
    if (q.includes('low'))     return { intent: 'FILTER', filters: { riskLevel: 'LOW' }, message: `Showing ${total - high - flagged} low-risk routine transactions.` };
    if (q.includes('summar') || q.includes('overview')) {
      return { intent: 'SUMMARY', message: `${total} transactions processed. ${flagged} flagged, ${high} high risk.` };
    }
    return { intent: 'GENERAL', message: `Try: "show high risk", "summarize today" or "any transactions from North Korea?"` };
  }
}

module.exports = LlmService;
