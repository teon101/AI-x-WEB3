# 🤖 AI-Powered Blockchain Transaction Monitor
 
 🐦 [Featured on Twitter](https://x.com/Teon101/status/1989125763958972633)

An intelligent blockchain monitoring agent that tracks Ethereum transactions in real-time, analyzes them with AI, and provides actionable insights through alerts and a REST API.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-purple)

## 🌟 Features

### 🔍 Real-Time Monitoring
- Monitors any Ethereum wallet address 24/7
- Checks every transaction in every block (~12 seconds)
- Detects incoming, outgoing, and contract interactions

### 🧠 AI-Powered Analysis
- **Smart Categorization**: Automatically classifies transactions (Exchange, DeFi, Whale, Contract)
- **Risk Scoring**: Calculates risk levels (0-100) based on multiple factors
- **Pattern Detection**: Identifies suspicious patterns (round numbers, high-value transfers)
- **Natural Language Summaries**: Generates human-readable transaction explanations
- **Known Address Recognition**: Labels major exchanges and contracts

### 📊 Data & Analytics
- Transaction history stored locally (JSON)
- Duplicate alert prevention
- Statistical analysis (total value, risk distribution, categories)
- RESTful API for data access

### 🎯 Smart Filtering
- Minimum transaction value threshold
- Zero-value transaction filtering (ignore token transfers)
- Status-based filtering (success/failed)
- Customizable alert rules

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Alchemy or Infura API key
- Ethereum wallet address to monitor

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/AI-x-WEB3.git
cd AI-x-WEB3

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configuration

Edit `.env` file:
```bash
# Blockchain RPC (Get from Alchemy/Infura)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Wallet address to monitor
MONITOR_ADDRESS=0x28C6c06298d514Db089934071355E5743bf21d60

# Email alerts (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_TO=recipient@gmail.com

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/blockchain-agent
```

### Run the Agent
```bash
# Start monitoring
node src/index.js

# The agent will:
# ✅ Connect to Ethereum
# ✅ Start monitoring transactions
# ✅ Display AI-powered alerts
# ✅ Start API server on port 3001
```

## 📡 API Endpoints

The agent exposes a REST API on `http://localhost:3001`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stats` | GET | Transaction statistics & analytics |
| `/api/transactions` | GET | All monitored transactions |
| `/api/transactions/recent` | GET | Last 10 transactions |
| `/api/transactions/recent/:limit` | GET | Last N transactions |
| `/api/transactions/high-risk` | GET | High-risk transactions only |
| `/api/transactions/whales` | GET | Whale transactions (>10 ETH) |

### Example API Usage
```bash
# Get statistics
curl http://localhost:3001/api/stats

# Get recent transactions
curl http://localhost:3001/api/transactions/recent/5

# Get high-risk transactions
curl http://localhost:3001/api/transactions/high-risk
```

## 🧠 AI Analysis Features

### Risk Scoring Algorithm

The AI calculates risk scores based on:
- **Transaction Value**: Higher amounts = higher risk
- **Round Numbers**: Suspicious for money laundering
- **Known Addresses**: Unknown wallets increase risk
- **Transaction Status**: Failed transactions are flagged
- **Pattern Detection**: Repeated behavior analysis

### Transaction Categories

- 🐋 **WHALE_ALERT**: Large transactions (>10 ETH)
- 🏦 **EXCHANGE**: Major exchange activity (Binance, Coinbase)
- 🔄 **DEFI**: DeFi protocol interactions (Uniswap, etc.)
- 📄 **CONTRACT**: Smart contract calls
- 💸 **TRANSFER**: Standard ETH transfers

### Example Alert Output
```
🤖 ===== AI-POWERED TRANSACTION ALERT ===== 🤖
🏦 Category: EXCHANGE
📤 Type: OUTGOING
─────────────────────────────────────────────
Hash: 0xba916b1e04ee951933b2813b67644fc5369bfd29e325fe6907914c2ffd2b20cc
From: 0x28C6c... (Binance Hot Wallet)
To: 0xF80a1... (Unknown Wallet)
Value: 0.0750247 ETH
Status: Success
Block: 23753271
─────────────────────────────────────────────
🟢 RISK SCORE: 10/100 (LOW)
─────────────────────────────────────────────
🧠 AI SUMMARY:
Sent 0.0750247 ETH to Unknown Wallet. Exchange-related transaction. 
🟢 Risk Level: LOW (10/100). 
✅ Recommended: Normal transaction, no action needed.
=============================================
```

## 📁 Project Structure
```
AI-x-WEB3/
├── src/
│   ├── api/
│   │   └── server.js          # REST API server
│   ├── services/
│   │   ├── blockchainService.js   # Ethereum monitoring
│   │   ├── storageService.js      # Data persistence
│   │   ├── emailService.js        # Email notifications
│   │   └── aiAnalyzer.js          # AI analysis engine
│   ├── utils/
│   │   └── filters.js         # Transaction filters
│   └── index.js               # Main application
├── data/
│   ├── transactions.json      # Transaction history
│   └── alerted.json          # Alert tracking
├── .env                       # Configuration (not in git)
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Blockchain**: ethers.js v6
- **API**: Express v5
- **Storage**: JSON file-based (upgradeable to MongoDB)
- **AI**: Custom pattern recognition + risk scoring
- **Notifications**: Nodemailer (email support)

## 📈 Roadmap

- [x] Real-time transaction monitoring
- [x] AI-powered analysis
- [x] REST API
- [x] Transaction filtering
- [x] Risk scoring
- [ ] Web dashboard (React)
- [ ] Telegram bot alerts
- [ ] Advanced ML anomaly detection
- [ ] Multi-chain support (Polygon, BSC, etc.)
- [ ] WebSocket real-time updates
- [ ] Historical data analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built during a 21-day blockchain development challenge
- Powered by Alchemy/Infura RPC nodes
- Inspired by the need for intelligent blockchain monitoring

## 📞 Contact

Created by [@teon101](https://github.com/teon101)

---

⭐ Star this repo if you find it useful!git add README.md
