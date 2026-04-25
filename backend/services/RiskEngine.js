/**
 * RegLens Risk Engine
 * Implements rule-based scoring for financial transactions.
 * Rules are modular and return potential flags and score contributions.
 */

class RiskEngine {
  /**
   * Evaluates a single transaction against all rules
   */
  static async evaluate(transaction, historicalContext = []) {
    let riskScore = 0;
    let riskReasons = [];

    // Rule 1: High Amount ( > 15,000 EUR/USD or eq )
    const amountResult = this.checkHighAmount(transaction);
    if (amountResult.flagged) {
      riskScore += amountResult.score;
      riskReasons.push(amountResult.rule);
    }

    // Rule 2: Velocity (Multiple from same account in short time)
    const velocityResult = this.checkVelocity(transaction, historicalContext);
    if (velocityResult.flagged) {
      riskScore += velocityResult.score;
      riskReasons.push(velocityResult.rule);
    }

    // Rule 3: Cross-border transaction
    const crossBorderResult = this.checkCrossBorder(transaction);
    if (crossBorderResult.flagged) {
      riskScore += crossBorderResult.score;
      riskReasons.push(crossBorderResult.rule);
    }

    // Rule 4: New/unknown beneficiary
    const newBeneficiaryResult = this.checkNewBeneficiary(transaction, historicalContext);
    if (newBeneficiaryResult.flagged) {
      riskScore += newBeneficiaryResult.score;
      riskReasons.push(newBeneficiaryResult.rule);
    }

    // Rule 5: Keyword risk in description
    const keywordResult = this.checkKeywords(transaction);
    if (keywordResult.flagged) {
      riskScore += keywordResult.score;
      riskReasons.push(keywordResult.rule);
    }

    // Rule 6: Unusual currency or country mismatch
    const mismatchResult = this.checkCurrencyCountryMismatch(transaction);
    if (mismatchResult.flagged) {
      riskScore += mismatchResult.score;
      riskReasons.push(mismatchResult.rule);
    }

    // Determine Risk Level (0-39 Low, 40-69 Medium, 70+ High)
    let riskLevel = 'LOW';
    if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'MEDIUM';

    const isFlagged = riskScore >= 40 || riskReasons.length > 0;

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      riskReasons,
      isFlagged,
      // Keep legacy fields populated for backwards comp
      triggeredRules: riskReasons,
      flagged: isFlagged
    };
  }

  static checkHighAmount(tx) {
    // Basic conversion logic approximation for demonstration
    let amountInUSD = tx.amount;
    if (tx.currency === 'EUR') amountInUSD = tx.amount * 1.1;
    if (tx.currency === 'INR') amountInUSD = tx.amount / 83; // approx
    
    if (amountInUSD > 15000) {
      return { flagged: true, score: 35, rule: `HIGH_AMOUNT: Transaction exceeds 15,000 equivalent` };
    }
    return { flagged: false };
  }

  static checkVelocity(tx, history) {
    if (!history || history.length === 0) return { flagged: false };
    
    // Check transfers from same sender in last 24h
    const recent = history.filter(h => 
      h.sender === tx.sender && 
      new Date(tx.timestamp) - new Date(h.timestamp) < 24 * 60 * 60 * 1000
    );

    if (recent.length >= 3) {
      return { flagged: true, score: 30, rule: 'VELOCITY_RISK: Multiple transactions from same account recently' };
    }
    return { flagged: false };
  }

  static checkCrossBorder(tx) {
    const sender = tx.senderCountry || tx.country;
    const receiver = tx.receiverCountry || tx.country;
    
    // Standard rule: different countries
    if (sender && receiver && sender !== receiver) {
      return { flagged: true, score: 20, rule: `CROSS_BORDER: Transfer between ${sender} and ${receiver}` };
    }
    return { flagged: false };
  }

  static checkNewBeneficiary(tx, history) {
    if (!history || history.length === 0) {
      // First transaction known for this sender
      return { flagged: true, score: 15, rule: 'NEW_BENEFICIARY: First transaction seen, unknown beneficiary' };
    }
    const previousToReceiver = history.some(h => h.sender === tx.sender && h.receiver === tx.receiver && h._id?.toString() !== tx._id?.toString());
    
    if (!previousToReceiver) {
      return { flagged: true, score: 15, rule: 'NEW_BENEFICIARY: No previous history sending to this beneficiary' };
    }
    return { flagged: false };
  }

  static checkKeywords(tx) {
    const suspiciousWords = ['crypto', 'cash', 'gift', 'urgent', 'loan repayment', 'unknown'];
    const textToCheck = (tx.description || '').toLowerCase();
    
    for (const word of suspiciousWords) {
      if (textToCheck.includes(word)) {
        return { flagged: true, score: 30, rule: `KEYWORD_RISK: Description contains suspicious keyword '${word}'` };
      }
    }
    return { flagged: false };
  }

  static checkCurrencyCountryMismatch(tx) {
    const defaultCurrencies = {
      'USA': 'USD', 'US': 'USD', 'United States': 'USD',
      'UK': 'GBP', 'United Kingdom': 'GBP',
      'India': 'INR', 'IN': 'INR',
      'EU': 'EUR', 'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR'
    };
    
    const expectedCurrency = defaultCurrencies[tx.country];
    if (expectedCurrency && tx.currency !== expectedCurrency) {
      return { flagged: true, score: 15, rule: `MISMATCH: Currency ${tx.currency} unusual for country ${tx.country}` };
    }
    return { flagged: false };
  }
}

module.exports = RiskEngine;
