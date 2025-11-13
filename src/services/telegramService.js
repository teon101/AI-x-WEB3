const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor(token, chatId) {
    this.token = token;
    this.chatId = chatId;
    this.bot = null;
    
    if (token && chatId) {
      this.bot = new TelegramBot(token, { polling: false });
    }
  }

  // Test connection
  async testConnection() {
    if (!this.bot) {
      console.log('⚠️  Telegram not configured');
      return false;
    }

    try {
      const me = await this.bot.getMe();
      console.log(`✅ Telegram bot connected: @${me.username}`);
      return true;
    } catch (error) {
      console.error('❌ Telegram connection failed:', error.message);
      return false;
    }
  }

  // Send a message
  async sendMessage(message, options = {}) {
    if (!this.bot) {
      console.log('⚠️  Telegram not configured, skipping message');
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      });
      console.log('📱 Telegram alert sent!');
      return true;
    } catch (error) {
      console.error('❌ Telegram send failed:', error.message);
      return false;
    }
  }

  // Format transaction alert
  formatTransactionAlert(txDetails) {
    const riskEmoji = txDetails.ai?.riskEmoji || '⚪';
    const categoryEmoji = txDetails.ai?.categoryEmoji || '📝';
    const typeEmoji = txDetails.emoji || '💸';
    
    const message = `
🤖 <b>BLOCKCHAIN ALERT</b>

${categoryEmoji} <b>Category:</b> ${txDetails.ai?.category || 'UNKNOWN'}
${typeEmoji} <b>Type:</b> ${txDetails.type || 'UNKNOWN'}

💰 <b>Value:</b> ${txDetails.value} ETH
${riskEmoji} <b>Risk:</b> ${txDetails.ai?.riskLevel || 'UNKNOWN'} (${txDetails.ai?.riskScore || 0}/100)

📤 <b>From:</b> ${this.truncateAddress(txDetails.from)}
<i>${txDetails.ai?.fromLabel || 'Unknown Wallet'}</i>

📥 <b>To:</b> ${this.truncateAddress(txDetails.to)}
<i>${txDetails.ai?.toLabel || 'Unknown Wallet'}</i>

🧠 <b>AI Summary:</b>
${txDetails.ai?.summary || 'No summary available'}

📦 <b>Block:</b> ${txDetails.blockNumber}
🔗 <a href="https://etherscan.io/tx/${txDetails.hash}">View on Etherscan</a>
    `.trim();

    return message;
  }

  // Send transaction alert
  async sendTransactionAlert(txDetails) {
    const message = this.formatTransactionAlert(txDetails);
    return await this.sendMessage(message);
  }

  // Send daily summary
  async sendDailySummary(stats) {
    const message = `
📊 <b>DAILY SUMMARY</b>

📝 <b>Transactions:</b> ${stats.totalTransactions}
🔔 <b>Alerts Sent:</b> ${stats.totalAlerted}
💰 <b>Total Value:</b> ${stats.totalValue} ETH
📈 <b>Average Value:</b> ${stats.averageValue} ETH

<b>Risk Distribution:</b>
🔴 High: ${stats.riskDistribution?.high || 0}
🟡 Medium: ${stats.riskDistribution?.medium || 0}
🟢 Low: ${stats.riskDistribution?.low || 0}

⏰ <i>${new Date().toLocaleString()}</i>
    `.trim();

    return await this.sendMessage(message);
  }

  // Send startup notification
  async sendStartupNotification() {
    const message = `
🚀 <b>BLOCKCHAIN MONITOR STARTED</b>

Your AI-powered blockchain monitoring agent is now active!

✅ Connected to Ethereum
✅ AI analysis enabled
✅ Real-time monitoring active

You'll receive alerts for important transactions.
    `.trim();

    return await this.sendMessage(message);
  }

  // Truncate address for display
  truncateAddress(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

module.exports = TelegramService;