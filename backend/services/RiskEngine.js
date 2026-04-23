/**
 * RegLens Risk Engine
 * Implements rule-based scoring for financial transactions.
 * Rules are modular and return potential flags and score contributions.
 */

const AML_REPORTING_THRESHOLD = 10000;

class RiskEngine {
  /**
   * Evaluates a single transaction against all rules
   */
  static async evaluate(transaction, historicalContext = []) {
    let riskScore = 0;
    let triggeredRules = [];

    // Rule 1: Threshold Rule (Structuring / Smurfing)
    const thresholdResult = this.checkThreshold(transaction);
    if (thresholdResult.flagged) {
      riskScore += thresholdResult.score;
      triggeredRules.push(thresholdResult.rule);
    }

    // Rule 2: Geo-Risk Rule
    const geoResult = this.checkGeoRisk(transaction);
    if (geoResult.flagged) {
      riskScore += geoResult.score;
      triggeredRules.push(geoResult.rule);
    }

    // Rule 3: Velocity Rule (Same sender/receiver frequency)
    const velocityResult = this.checkVelocity(transaction, historicalContext);
    if (velocityResult.flagged) {
      riskScore += velocityResult.score;
      triggeredRules.push(velocityResult.rule);
    }

    // Determine Risk Level
    let riskLevel = 'LOW';
    if (riskScore >= 70) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      flagged: riskScore > 0,
      triggeredRules
    };
  }

  /**
   * Check if amount is suspiciously close to the $10k threshold
   */
  static checkThreshold(tx) {
    const amount = tx.amount;
    // Standard banking "structuring" check: just below 10k
    if (amount >= 9000 && amount < AML_REPORTING_THRESHOLD) {
      return { 
        flagged: true, 
        score: 40, 
        rule: 'THRESHOLD_PROXIMITY: Amount just below $10,000 reporting limit' 
      };
    }
    if (amount >= AML_REPORTING_THRESHOLD) {
      return { 
        flagged: true, 
        score: 20, 
        rule: 'THRESHOLD_REACHED: Transaction exceeds $10,000' 
      };
    }
    return { flagged: false };
  }

  /**
   * Check for high-risk jurisdictions
   */
  static checkGeoRisk(tx) {
    const highRiskCountries = ['North Korea', 'Iran', 'Syria', 'Cayman Islands', 'Panama'];
    if (highRiskCountries.includes(tx.country)) {
      return { 
        flagged: true, 
        score: 50, 
        rule: `GEO_RISK: High-risk jurisdiction detected (${tx.country})` 
      };
    }
    return { flagged: false };
  }

  /**
   * Check for frequent repeated transactions (Velocity)
   */
  static checkVelocity(tx, history) {
    if (!history || history.length === 0) return { flagged: false };

    // Find transactions with same sender and receiver in the last 24 hours
    const recent = history.filter(h => 
      h.sender === tx.sender && 
      h.receiver === tx.receiver &&
      new Date(tx.timestamp) - new Date(h.timestamp) < 24 * 60 * 60 * 1000
    );

    if (recent.length >= 3) {
      return { 
        flagged: true, 
        score: 35, 
        rule: 'VELOCITY_ALERT: Multiple transfers to same receiver within 24h' 
      };
    }
    return { flagged: false };
  }
}

module.exports = RiskEngine;
