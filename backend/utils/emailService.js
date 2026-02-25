const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Email credentials missing in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAlertEmail({ alertId, token, processed }) {
  try {
    const resolveLink = `${process.env.BASE_URL}/alerts/resolve/${alertId}?token=${token}`;
    const dashboardLink = process.env.DASHBOARD_URL;

    const mailOptions = {
      from: `"Water Monitoring System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECEIVER,
      subject: "⚠ Water Quality Alert - Action Required",
      html: `
        <h2>⚠ Water Quality Alert</h2>
        <p>Unsafe water conditions detected.</p>

        <table border="1" cellpadding="6" cellspacing="0">
          <tr>
            <th>Quality Score</th>
            <td>${processed.qualityScore}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>${processed.message}</td>
          </tr>
        </table>

        <br/>

        <a href="${resolveLink}" 
           style="padding:10px 15px;background:red;color:white;text-decoration:none;border-radius:5px;">
           Acknowledge & Reset System
        </a>

        <br/><br/>

        View Dashboard:
        <a href="${dashboardLink}">${dashboardLink}</a>

        <p style="margin-top:20px;font-size:12px;color:gray;">
          This link will expire in 15 minutes.
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Alert email sent successfully");

  } catch (error) {
    console.error("Error sending alert email:", error);
    throw error;
  }
}

module.exports = { sendAlertEmail };