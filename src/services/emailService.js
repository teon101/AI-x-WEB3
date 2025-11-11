const nodemailer = require('nodemailer');

class EmailService {
  constructor(emailUser, emailPass, emailTo) {
    this.emailTo = emailTo;
    
    // Create transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected');
      return true;
    } catch (error) {
      console.error('❌ Email connection failed:', error.message);
      return false;
    }
  }

  // Send transaction alert email
  async sendTransactionAlert(txDetails) {
    try {
      const subject = `🚨 ${txDetails.emoji} ${txDetails.type} Transaction Alert - ${txDetails.valueNum} ETH`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">🔔 Blockchain Transaction Alert</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${txDetails.emoji} ${txDetails.type} Transaction</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Hash:</td>
                <td style="padding: 8px; word-break: break-all;">
                  <a href="https://etherscan.io/tx/${txDetails.hash}" target="_blank">
                    ${txDetails.hash}
                  </a>
                </td>
              </tr>
              <tr style="background: white;">
                <td style="padding: 8px; font-weight: bold;">From:</td>
                <td style="padding: 8px; word-break: break-all;">
                  <a href="https://etherscan.io/address/${txDetails.from}" target="_blank">
                    ${txDetails.from}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">To:</td>
                <td style="padding: 8px; word-break: break-all;">
                  <a href="https://etherscan.io/address/${txDetails.to}" target="_blank">
                    ${txDetails.to}
                  </a>
                </td>
              </tr>
              <tr style="background: white;">
                <td style="padding: 8px; font-weight: bold;">Value:</td>
                <td style="padding: 8px; font-size: 18px; color: #4CAF50;">
                  <strong>${txDetails.value} ETH</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Status:</td>
                <td style="padding: 8px;">
                  <span style="color: ${txDetails.status === 'Success' ? 'green' : 'red'};">
                    ${txDetails.status}
                  </span>
                </td>
              </tr>
              <tr style="background: white;">
                <td style="padding: 8px; font-weight: bold;">Block:</td>
                <td style="padding: 8px;">${txDetails.blockNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Time:</td>
                <td style="padding: 8px;">${new Date(txDetails.timestamp).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Powered by Blockchain AI Agent 🤖
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Blockchain AI Agent" <${process.env.EMAIL_USER}>`,
        to: this.emailTo,
        subject: subject,
        html: html
      });

      console.log('📧 Email alert sent!');
      return true;
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      return false;
    }
  }

  // Send daily summary
  async sendDailySummary(stats) {
    try {
      const subject = `📊 Daily Blockchain Monitoring Summary`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196F3;">📊 Daily Summary Report</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Today's Activity</h3>
            
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 10px; background: white; margin: 10px 0; border-radius: 4px;">
                📝 <strong>Total Transactions:</strong> ${stats.totalTransactions}
              </li>
              <li style="padding: 10px; background: white; margin: 10px 0; border-radius: 4px;">
                🔔 <strong>Alerts Sent:</strong> ${stats.totalAlerted}
              </li>
              <li style="padding: 10px; background: white; margin: 10px 0; border-radius: 4px;">
                ⏰ <strong>Report Time:</strong> ${new Date().toLocaleString()}
              </li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Powered by Blockchain AI Agent 🤖
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Blockchain AI Agent" <${process.env.EMAIL_USER}>`,
        to: this.emailTo,
        subject: subject,
        html: html
      });

      console.log('📊 Daily summary sent!');
      return true;
    } catch (error) {
      console.error('❌ Summary send failed:', error.message);
      return false;
    }
  }
}

module.exports = EmailService;