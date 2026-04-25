class PrivacyService {
  constructor() {
    this.tokenMap = new Map();
    this.valueMap = new Map();
    this.counter = 1;
  }

  /**
   * Replaces sensitive PII with tokens (e.g., Entity_1)
   */
  tokenize(value) {
    if (!value || typeof value !== 'string') return value;
    
    // Exact match optimization for same entity in same batch
    if (this.valueMap.has(value)) {
      return this.valueMap.get(value);
    }

    const token = `Entity_${this.counter++}`;
    this.tokenMap.set(token, value);
    this.valueMap.set(value, token);
    
    return token;
  }

  /**
   * Replaces tokens in generated text with the original PII.
   */
  detokenize(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    // Basic string replace for all known tokens currently in memory
    for (const [token, originalValue] of this.tokenMap.entries()) {
      if (result.includes(token)) {
        // Global replace logic
        const regex = new RegExp(token, 'g');
        result = result.replace(regex, originalValue);
      }
    }
    return result;
  }

  /**
   * Clears the current token mappings. Useful to call after a batch request.
   */
  clear() {
    this.tokenMap.clear();
    this.valueMap.clear();
    this.counter = 1;
  }
}

module.exports = PrivacyService;
