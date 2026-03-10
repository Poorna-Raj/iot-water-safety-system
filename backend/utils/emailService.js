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

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
      JSON.stringify({
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [processed.qualityScore, 100 - processed.qualityScore],
              backgroundColor: ["#ff4d4d", "#e0e0e0"],
            },
          ],
          labels: ["Quality", "Remaining"],
        },
        options: {
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      }),
    )}`;

    const mailOptions = {
      from: `"Water Monitoring System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_RECEIVER,
      subject: "⚠ Water Quality Alert - Action Required",
      html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px;">
        
        <!-- Header -->
        <div style="background:#ff4d4d; color:white; text-align:center; padding:15px; border-radius:8px;">
          <h2 style="margin:0;">⚠ Water Quality Alert</h2>
        </div>

        <!-- Intro text -->
        <p style="margin-top:20px;">Unsafe water conditions have been detected. Immediate action is required.</p>

        <!-- Quality Score Chart -->
        <div style="text-align:center; margin-top:20px;">
          <img src="${chartUrl}" alt="Quality Score" style="width:130px; height:130px;"/>
          <p style="font-weight:bold; margin-top:10px;">Quality Score: ${processed.qualityScore}</p>
        </div>

        <!-- Details Card -->
        <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-top:20px;">
          <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#e8e8e8;">
              <th style="padding:10px; text-align:left; border:1px solid #ddd;">Status</th>
              <td style="padding:10px; border:1px solid #ddd;">${processed.message}</td>
            </tr>
          </table>
        </div>

        <!-- Action Button -->
        <div style="text-align:center; margin-top:20px;">
          <a href="${resolveLink}" style="display:inline-block; padding:12px 20px; background:#ff4d4d; color:white; font-weight:bold; text-decoration:none; border-radius:5px;">
            Acknowledge & Reset
          </a>
        </div>

        <!-- Dashboard Link -->
        <p style="text-align:center; margin-top:15px;">
          View Dashboard: <a href="${dashboardLink}" style="color:#1a73e8;">${dashboardLink}</a>
        </p>

        <!-- Footer -->
        <p style="font-size:12px; color:gray; text-align:center; margin-top:20px;">
          This link will expire in 15 minutes.
        </p>

      </div>
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
