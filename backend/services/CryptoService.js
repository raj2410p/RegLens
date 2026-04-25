const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// Derive a 32-byte key from the environment variable or use a fallback
const secret = process.env.ENCRYPT_KEY || 'default_reglens_secret_key_12345';
const key = crypto.scryptSync(secret, 'salt', 32);

class CryptoService {
  /**
   * Encrypts a string using AES-256-CBC with a random IV.
   */
  static encrypt(text) {
    if (!text) return text;
    // Dont encrypt if already encrypted
    if (typeof text === 'string' && text.startsWith('ENC:')) return text;

    const textStr = String(text);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(textStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return format: ENC:<IV_HEX>:<ENCRYPTED_DATA_HEX>
    return `ENC:${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted string
   */
  static decrypt(text) {
    if (!text) return text;
    if (typeof text === 'string' && !text.startsWith('ENC:')) return text; // Plaintext

    try {
      const parts = text.split(':');
      if (parts.length !== 3) return text;

      const iv = Buffer.from(parts[1], 'hex');
      const encryptedText = parts[2];
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (err) {
      console.error('[CryptoService] Decryption failed:', err.message);
      return '[DECRYPTION FAILED]'; // Safe fallback
    }
  }
}

module.exports = CryptoService;
