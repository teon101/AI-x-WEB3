const express = require('express');
const StorageService = require('../services/storageService');

class APIServer {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.storageService = new StorageService('./data');
    
    // Middleware
    this.app.use(express.json());
    
    // CORS for frontend access
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    
    this.setupRoutes();
  }

setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Get all transactions
    this.app.get('/api/transactions', async (req, res) => {
      try {
        const transactions = await this.storageService.getAllTransactions();
        res.json({ success: true, data: transactions });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get stats
    this.app.get('/api/stats', async (req, res) => {
      try {
        const stats = await this.storageService.getStats();
        
        // Calculate additional stats
        const transactions = await this.storageService.getAllTransactions();
        
        const totalValue = transactions.reduce((sum, tx) => {
          return sum + parseFloat(tx.value || 0);
        }, 0);

        const riskDistribution = {
          high: transactions.filter(tx => tx.ai?.riskLevel === 'HIGH').length,
          medium: transactions.filter(tx => tx.ai?.riskLevel === 'MEDIUM').length,
          low: transactions.filter(tx => tx.ai?.riskLevel === 'LOW').length,
        };

        const categoryDistribution = {};
        transactions.forEach(tx => {
          const category = tx.ai?.category || 'UNKNOWN';
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        });

        res.json({
          success: true,
          data: {
            ...stats,
            totalValue: totalValue.toFixed(4),
            riskDistribution,
            categoryDistribution,
            averageValue: transactions.length > 0 ? (totalValue / transactions.length).toFixed(4) : 0
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get recent transactions (default 10)
    this.app.get('/api/transactions/recent', async (req, res) => {
      try {
        const transactions = await this.storageService.getAllTransactions();
        const recent = transactions.slice(-10).reverse();
        
        res.json({ success: true, data: recent });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get recent transactions (with custom limit)
    this.app.get('/api/transactions/recent/:limit', async (req, res) => {
      try {
        const limit = parseInt(req.params.limit) || 10;
        const transactions = await this.storageService.getAllTransactions();
        const recent = transactions.slice(-limit).reverse();
        
        res.json({ success: true, data: recent });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get high-risk transactions
    this.app.get('/api/transactions/high-risk', async (req, res) => {
      try {
        const transactions = await this.storageService.getAllTransactions();
        const highRisk = transactions.filter(tx => tx.ai?.riskLevel === 'HIGH');
        
        res.json({ success: true, data: highRisk });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get whale transactions
    this.app.get('/api/transactions/whales', async (req, res) => {
      try {
        const transactions = await this.storageService.getAllTransactions();
        const whales = transactions.filter(tx => tx.ai?.isWhale === true);
        
        res.json({ success: true, data: whales });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🌐 API Server running on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 API Server stopped');
    }
  }
}

module.exports = APIServer;