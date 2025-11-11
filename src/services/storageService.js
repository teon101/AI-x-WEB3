const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.txFile = path.join(dataDir, 'transactions.json');
    this.alertedFile = path.join(dataDir, 'alerted.json');
  }

  // Initialize storage
  async initialize() {
    
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Create files if they don't exist
      await this.ensureFileExists(this.txFile, []);
      await this.ensureFileExists(this.alertedFile, []);
      
      console.log('💾 Storage initialized');
    } catch (error) {
      console.error('❌ Storage initialization failed:', error.message);
    }
  }

  // Ensure file exists
  async ensureFileExists(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  // Check if transaction was already alerted
  async wasAlerted(txHash) {
    try {
      const data = await fs.readFile(this.alertedFile, 'utf-8');
      const alerted = JSON.parse(data);
      return alerted.includes(txHash);
    } catch (error) {
      return false;
    }
  }

  // Mark transaction as alerted
  async markAsAlerted(txHash) {
    try {
      const data = await fs.readFile(this.alertedFile, 'utf-8');
      const alerted = JSON.parse(data);
      
      if (!alerted.includes(txHash)) {
        alerted.push(txHash);
        await fs.writeFile(this.alertedFile, JSON.stringify(alerted, null, 2));
      }
    } catch (error) {
      console.error('Error marking as alerted:', error.message);
    }
  }

  // Save transaction details
  async saveTransaction(txDetails) {
    try {
      const data = await fs.readFile(this.txFile, 'utf-8');
      const transactions = JSON.parse(data);
      
      // Add timestamp if not present
      if (!txDetails.savedAt) {
        txDetails.savedAt = new Date().toISOString();
      }
      
      transactions.push(txDetails);
      
      // Keep only last 1000 transactions
      if (transactions.length > 1000) {
        transactions.shift();
      }
      
      await fs.writeFile(this.txFile, JSON.stringify(transactions, null, 2));
      console.log('💾 Transaction saved to storage');
    } catch (error) {
      console.error('Error saving transaction:', error.message);
    }
  }

  // Get all transactions
  async getAllTransactions() {
    try {
      const data = await fs.readFile(this.txFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Get transaction statistics
  async getStats() {
    try {
      const transactions = await this.getAllTransactions();
      const alerted = JSON.parse(await fs.readFile(this.alertedFile, 'utf-8'));
      
      return {
        totalTransactions: transactions.length,
        totalAlerted: alerted.length,
        lastTransaction: transactions[transactions.length - 1] || null
      };
    } catch (error) {
      return {
        totalTransactions: 0,
        totalAlerted: 0,
        lastTransaction: null
      };
    }
  }
}

module.exports = StorageService;