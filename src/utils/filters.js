const { ethers } = require('ethers');

class TransactionFilter {
  constructor(options = {}) {
    this.minValue = options.minValue || 0; // Minimum ETH value
    this.ignoreZeroValue = options.ignoreZeroValue || false;
  }

  // Check if transaction should trigger an alert
  shouldAlert(txDetails) {
    // Parse the value
    const value = parseFloat(txDetails.value);

    // Filter 1: Ignore zero-value transactions (token transfers)
    if (this.ignoreZeroValue && value === 0) {
      console.log('   ⏭️  Skipped: Zero-value transaction');
      return false;
    }

    // Filter 2: Check minimum value
    if (value < this.minValue) {
      console.log(`   ⏭️  Skipped: Value ${value} ETH below minimum ${this.minValue} ETH`);
      return false;
    }

    // Filter 3: Only successful transactions
    if (txDetails.status !== 'Success') {
      console.log('   ⏭️  Skipped: Transaction failed');
      return false;
    }

    return true;
  }

  // Get human-readable transaction type
  getTransactionType(txDetails, monitorAddress) {
    const from = txDetails.from.toLowerCase();
    const to = txDetails.to ? txDetails.to.toLowerCase() : '';
    const monitor = monitorAddress.toLowerCase();

    if (from === monitor && to === monitor) {
      return 'SELF-TRANSFER';
    } else if (from === monitor) {
      return 'OUTGOING';
    } else if (to === monitor) {
      return 'INCOMING';
    }
    
    return 'UNKNOWN';
  }

  // Format transaction for display
  formatTransaction(txDetails, monitorAddress) {
    const type = this.getTransactionType(txDetails, monitorAddress);
    const value = parseFloat(txDetails.value);
    
    let emoji = '💸';
    if (type === 'INCOMING') emoji = '📥';
    if (type === 'OUTGOING') emoji = '📤';
    if (value > 10) emoji = '🐋'; // Whale alert!

    return {
      ...txDetails,
      type,
      emoji,
      valueNum: value
    };
  }
}

module.exports = TransactionFilter;