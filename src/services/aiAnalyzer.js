const { ethers } = require('ethers');

class AIAnalyzer {
  constructor() {
    // Transaction patterns
    this.patterns = {
      whale: 10, // ETH amount for whale alert
      roundNumber: [1, 5, 10, 50, 100], // Round number detection
      highGas: 0.01, // High gas threshold
    };
    
    // Known addresses (you can expand this)
    this.knownAddresses = {
      '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance Hot Wallet',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT Contract',
      '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap V3 Router',
      '0xa090e606e30bd747d4e6245a1517ebe430f0057e': 'Coinbase Wallet',
    };
  }

  // Get friendly name for address
  getAddressLabel(address) {
    const lowerAddress = address.toLowerCase();
    return this.knownAddresses[lowerAddress] || 'Unknown Wallet';
  }

  // Detect if transaction is a whale move
  isWhaleTransaction(valueInEth) {
    return valueInEth >= this.patterns.whale;
  }

  // Detect round numbers (suspicious for money laundering)
  isRoundNumber(valueInEth) {
    return this.patterns.roundNumber.some(num => 
      Math.abs(valueInEth - num) < 0.0001
    );
  }

  // Calculate transaction risk score (0-100)
  calculateRiskScore(txDetails) {
    let risk = 0;
    const value = parseFloat(txDetails.value);

    // High value = higher risk
    if (value > 100) risk += 40;
    else if (value > 50) risk += 30;
    else if (value > 10) risk += 20;
    else if (value > 1) risk += 10;

    // Round numbers = suspicious
    if (this.isRoundNumber(value)) risk += 20;

    // Unknown addresses = higher risk
    const fromLabel = this.getAddressLabel(txDetails.from);
    const toLabel = this.getAddressLabel(txDetails.to);
    
    if (fromLabel === 'Unknown Wallet' && toLabel === 'Unknown Wallet') {
      risk += 15;
    }

    // Failed transactions = suspicious
    if (txDetails.status !== 'Success') risk += 25;

    return Math.min(risk, 100); // Cap at 100
  }

  // Get risk level label
  getRiskLevel(score) {
    if (score >= 70) return { level: 'HIGH', emoji: '🔴', color: 'red' };
    if (score >= 40) return { level: 'MEDIUM', emoji: '🟡', color: 'orange' };
    return { level: 'LOW', emoji: '🟢', color: 'green' };
  }

  // Categorize transaction type
  categorizeTransaction(txDetails, monitorAddress) {
    const value = parseFloat(txDetails.value);
    const fromLabel = this.getAddressLabel(txDetails.from);
    const toLabel = this.getAddressLabel(txDetails.to);
    
    // Whale alert
    if (this.isWhaleTransaction(value)) {
      return {
        category: 'WHALE_ALERT',
        emoji: '🐋',
        description: 'Large transaction detected'
      };
    }

    // Exchange activity
    if (fromLabel.includes('Binance') || fromLabel.includes('Coinbase') ||
        toLabel.includes('Binance') || toLabel.includes('Coinbase')) {
      return {
        category: 'EXCHANGE',
        emoji: '🏦',
        description: 'Exchange-related transaction'
      };
    }

    // DeFi activity
    if (toLabel.includes('Uniswap') || toLabel.includes('Router')) {
      return {
        category: 'DEFI',
        emoji: '🔄',
        description: 'DeFi interaction'
      };
    }

    // Contract interaction
    if (txDetails.to && txDetails.to.toLowerCase() !== monitorAddress.toLowerCase()) {
      return {
        category: 'CONTRACT',
        emoji: '📄',
        description: 'Smart contract interaction'
      };
    }

    // Regular transfer
    return {
      category: 'TRANSFER',
      emoji: '💸',
      description: 'Standard ETH transfer'
    };
  }

  // Generate AI summary
  generateSummary(txDetails, monitorAddress) {
    const value = parseFloat(txDetails.value);
    const fromLabel = this.getAddressLabel(txDetails.from);
    const toLabel = this.getAddressLabel(txDetails.to);
    const category = this.categorizeTransaction(txDetails, monitorAddress);
    const riskScore = this.calculateRiskScore(txDetails);
    const risk = this.getRiskLevel(riskScore);

    // Build natural language summary
    let summary = '';

    // Opening
    if (txDetails.type === 'INCOMING') {
      summary += `Received ${value} ETH from ${fromLabel}. `;
    } else if (txDetails.type === 'OUTGOING') {
      summary += `Sent ${value} ETH to ${toLabel}. `;
    }

    // Category context
    summary += category.description + '. ';

    // Whale alert
    if (this.isWhaleTransaction(value)) {
      summary += `🐋 WHALE ALERT: This is a large transaction! `;
    }

    // Round number warning
    if (this.isRoundNumber(value)) {
      summary += `⚠️ Suspicious: Transaction is a round number. `;
    }

    // Risk assessment
    summary += `${risk.emoji} Risk Level: ${risk.level} (${riskScore}/100). `;

    // Recommendation
    if (risk.level === 'HIGH') {
      summary += '🚨 Recommended: Monitor this address closely.';
    } else if (risk.level === 'MEDIUM') {
      summary += '👀 Recommended: Keep an eye on future activity.';
    } else {
      summary += '✅ Recommended: Normal transaction, no action needed.';
    }

    return {
      summary,
      category: category.category,
      categoryEmoji: category.emoji,
      riskScore,
      riskLevel: risk.level,
      riskEmoji: risk.emoji,
      fromLabel,
      toLabel,
      isWhale: this.isWhaleTransaction(value),
      isRoundNumber: this.isRoundNumber(value)
    };
  }

  // Analyze transaction (main function)
  analyzeTransaction(txDetails, monitorAddress) {
    const analysis = this.generateSummary(txDetails, monitorAddress);
    
    return {
      ...txDetails,
      ai: analysis
    };
  }
}

module.exports = AIAnalyzer;