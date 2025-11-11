const { ethers } = require('ethers');

class BlockchainService {
  constructor(rpcUrl, monitorAddress) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.monitorAddress = monitorAddress.toLowerCase();
    this.isMonitoring = false;
  }

  // Test connection
  async testConnection() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.provider.getBalance(this.monitorAddress);
      
      return {
        success: true,
        blockNumber,
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if address is involved in a transaction
  isAddressInvolved(tx) {
    if (!tx) return false;
    
    const from = tx.from ? tx.from.toLowerCase() : '';
    const to = tx.to ? tx.to.toLowerCase() : '';
    
    return from === this.monitorAddress || to === this.monitorAddress;
  }

  // Get transaction details
  async getTransactionDetails(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt ? receipt.gasUsed.toString() : 'Pending',
        status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
        blockNumber: tx.blockNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching transaction details:', error.message);
      return null;
    }
  }

// Start monitoring
  async startMonitoring(onTransactionFound) {
    if (this.isMonitoring) {
      console.log('⚠️  Already monitoring...');
      return;
    }

    console.log('👀 Starting to monitor address:', this.monitorAddress);
    this.isMonitoring = true;

    // Listen for new blocks
    this.provider.on('block', async (blockNumber) => {
      console.log(`\n📦 New block: ${blockNumber}`);
      
      try {
        // Get the block with transaction hashes only (faster)
        const block = await this.provider.getBlock(blockNumber, false);
        
        if (!block || !block.transactions || block.transactions.length === 0) {
          console.log('   ⚠️  No transactions in block');
          return;
        }

        console.log(`   📊 Checking ${block.transactions.length} transactions...`);

        // Check each transaction hash
        let checked = 0;
        let found = 0;
        
        for (const txHash of block.transactions) {
          checked++;
          
          try {
            // Fetch full transaction details
            const tx = await this.provider.getTransaction(txHash);
            
            if (this.isAddressInvolved(tx)) {
              found++;
              console.log(`🚨 TRANSACTION DETECTED! (${found} in this block)`);
              
              // Get full details
              const details = await this.getTransactionDetails(tx.hash);
              
              if (details && onTransactionFound) {
                onTransactionFound(details);
              }
            }
          } catch (txError) {
            // Skip failed transaction fetches
            continue;
          }
          
          // Log progress every 50 transactions
          if (checked % 50 === 0) {
            console.log(`   ⏳ Progress: ${checked}/${block.transactions.length}...`);
          }
        }
        
        console.log(`   ✅ Checked ${checked} transactions - Found ${found} matches`);
        
      } catch (error) {
        console.error('   ❌ Error processing block:', error.message);
      }
    });
  }
  
  // Stop monitoring
  stopMonitoring() {
    this.provider.removeAllListeners('block');
    this.isMonitoring = false;
    console.log('🛑 Monitoring stopped');
  }
}

module.exports = BlockchainService;