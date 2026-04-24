const { parse } = require('csv-parse/sync');
const xml2js = require('xml2js');

class ParserService {
  /**
   * Parses CSV data into normalized transactions
   */
  static parseCSV(buffer) {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    return records.map(record => this.normalize(record, 'CSV'));
  }

  /**
   * Parses JSON data into normalized transactions
   */
  static parseJSON(buffer) {
    const data = JSON.parse(buffer.toString());
    const records = Array.isArray(data) ? data : [data];
    return records.map(record => this.normalize(record, 'JSON'));
  }

  /**
   * Parses XML data (Basic support for MVP)
   */
  static async parseXML(buffer) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(buffer.toString());
    
    // Assume a structure like <Transactions><Transaction>...</Transaction></Transactions>
    let records = [];
    if (result.Transactions && result.Transactions.Transaction) {
      records = Array.isArray(result.Transactions.Transaction) 
        ? result.Transactions.Transaction 
        : [result.Transactions.Transaction];
    }
    
    return records.map(record => this.normalize(record, 'XML'));
  }

  /**
   * Parses PDF data by extracting text and using AI to identify records
   */
  static async parsePDF(buffer, llmService) {
    if (!llmService) throw new Error('LLM Service required for PDF extraction');
    
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await parser.getText();
    const text = result.text;

    if (!text || text.trim().length < 5) {
      throw new Error('Could not extract meaningful text from PDF.');
    }

    // Use AI to extract transactions
    const records = await llmService.parseUnstructuredTransactions(text);
    
    return records.map(record => this.normalize(record, 'PDF'));
  }

  /**
   * Normalizes a raw record from any source into our internal schema
   */
  static normalize(raw, format) {
    return {
      transactionId: raw.transactionId || raw.id || `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(raw.timestamp || raw.date || Date.now()),
      sender: raw.sender || raw.from || 'Unknown',
      receiver: raw.receiver || raw.to || 'Unknown',
      amount: parseFloat(raw.amount || 0),
      currency: raw.currency || 'USD',
      country: raw.country || 'Unknown',
      transactionType: raw.transactionType || raw.type || 'Transfer',
      sourceFormat: format,
      rawSourceReference: JSON.stringify(raw)
    };
  }

  /**
   * Stub for ISO 20022 parsing
   */
  static parseISO20022(buffer) {
    throw new Error('ISO 20022 parser not implemented in MVP. Check schema adapter.');
  }

  /**
   * Stub for SWIFT MT parsing
   */
  static parseSWIFT(buffer) {
    throw new Error('SWIFT MT parser not implemented in MVP. Check schema adapter.');
  }
}

module.exports = ParserService;
