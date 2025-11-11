require('dotenv').config();
const BlockchainService = require('./services/blockchainService');
const StorageService = require('./services/storageService');
const TransactionFilter = require('./utils/filters');
const EmailService = require('./services/emailService');
const AIAnalyzer = require('./services/aiAnalyzer');
const APIServer = require('./api/server');

// Initialize services
const blockchainService = new BlockchainService(
  process.env.RPC_URL,
  process.env.MONITOR_ADDRESS
);

const storageService = new StorageService('./data');

const emailService = new EmailService(
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS,
  process.env.EMAIL_TO
);

const txFilter = new TransactionFilter({
  minValue: 0.001,        // Only alert for transactions > 0.001 ETH
  ignoreZeroValue: false  // Set to true to ignore token transfers
});
const apiServer = new APIServer(3001);
const aiAnalyzer = new AIAnalyzer();

// Callback function when transaction is found
async function handleTransaction(txDetails) {
  try {
    // Check if already alerted
    const alreadyAlerted = await storageService.wasAlerted(txDetails.hash);
    if (alreadyAlerted) {
      console.log('   ⏭️  Already alerted for this transaction');
      return;
    }

    // Apply filters
    if (!txFilter.shouldAlert(txDetails)) {
      return;
    }

    // Format transaction FIRST
    const formatted = txFilter.formatTransaction(txDetails, process.env.MONITOR_ADDRESS);
    
    // Then analyze with AI
    const analyzed = aiAnalyzer.analyzeTransaction(formatted, process.env.MONITOR_ADDRESS);

    // Display enhanced alert
    console.log('\n🤖 ===== AI-POWERED TRANSACTION ALERT ===== 🤖');
    console.log(`${analyzed.ai.categoryEmoji} Category: ${analyzed.ai.category}`);
    console.log(`${analyzed.emoji} Type: ${analyzed.type}`);
    console.log('─────────────────────────────────────────────');
    console.log('Hash:', analyzed.hash);
    console.log('From:', `${analyzed.from} (${analyzed.ai.fromLabel})`);
    console.log('To:', `${analyzed.to} (${analyzed.ai.toLabel})`);
    console.log('Value:', analyzed.value, 'ETH');
    console.log('Status:', analyzed.status);
    console.log('Block:', analyzed.blockNumber);
    console.log('─────────────────────────────────────────────');
    console.log(`${analyzed.ai.riskEmoji} RISK SCORE: ${analyzed.ai.riskScore}/100 (${analyzed.ai.riskLevel})`);
    console.log('─────────────────────────────────────────────');
    console.log('🧠 AI SUMMARY:');
    console.log(analyzed.ai.summary);
    console.log('=============================================\n');

    // Send email alert (disabled)
    // await emailService.sendTransactionAlert(analyzed);

    // Save to storage - save the analyzed version with AI insights
    await storageService.saveTransaction(analyzed);
    await storageService.markAsAlerted(txDetails.hash);

  } catch (error) {
    console.error('Error handling transaction:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Blockchain AI Agent Starting...\n');

  // Initialize storage
  await storageService.initialize();
  // Start API server
  await apiServer.start();

  // Test email connection (disabled)
  // await emailService.testConnection();

  // Show current stats
  const stats = await storageService.getStats();
  console.log('📊 Stats:');
  console.log('  - Total transactions saved:', stats.totalTransactions);
  console.log('  - Total alerts sent:', stats.totalAlerted);
  console.log('');

  // Test connection
  console.log('🔌 Testing connection...');
  const connectionTest = await blockchainService.testConnection();
  
  if (!connectionTest.success) {
    console.error('❌ Connection failed:', connectionTest.error);
    process.exit(1);
  }

  console.log('✅ Connected to blockchain!');
  console.log('📦 Latest block:', connectionTest.blockNumber);
  console.log('💰 Wallet balance:', connectionTest.balance, 'ETH\n');

  // Start monitoring
  await blockchainService.startMonitoring(handleTransaction);
  
  console.log('✨ Agent is now running! Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down gracefully...');
  
  apiServer.stop();
  blockchainService.stopMonitoring();
  
  const stats = await storageService.getStats();
  console.log('\n📊 Final Stats:');
  console.log('  - Total transactions saved:', stats.totalTransactions);
  console.log('  - Total alerts sent:', stats.totalAlerted);
  
  blockchainService.stopMonitoring();
  process.exit(0);
});

// Start the agent
main().catch(console.error);