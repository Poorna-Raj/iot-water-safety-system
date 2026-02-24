// utils/emailService.js

const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendAlertEmail({ alertId, token, processed }) {
  const resolveLink = `https://yourdomain.com/api/alerts/resolve/${alertId}?token=${token}`;
  const dashboardLink = `https://yourdashboard.com`;

  const msg = {
    to: process.env.ALERT_RECEIVER,
    from: process.env.SENDER_EMAIL, // verified sender in SendGrid
    subject: "⚠ Water Quality Alert - Action Required",
    html: `
      <h2>⚠ Water Quality Alert</h2>
      <p>Unsafe conditions detected.</p>

      <table border="1" cellpadding="6">
        <tr><th>Quality Score</th><td>${processed.qualityScore}</td></tr>
        <tr><th>Status</th><td>${processed.message}</td></tr>
      </table>

      <br/>
      <a href="${resolveLink}" 
         style="padding:10px 15px;background:red;color:white;text-decoration:none;">
         Acknowledge & Reset System
      </a>

      <br/><br/>
      Dashboard: <a href="${dashboardLink}">${dashboardLink}</a>
    `,
  };

  await sgMail.send(msg);
}

module.exports = { sendAlertEmail };