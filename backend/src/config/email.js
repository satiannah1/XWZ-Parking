const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter — uses Gmail by default, swap for any SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendTicketEmail = async ({ to, ticket, parking }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email credentials not configured — skipping ticket email');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"XWZ Parking System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🅿 Parking Ticket — ${ticket.ticketNumber}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#f0f4f8;padding:24px;">
          <div style="background:linear-gradient(135deg,#1a3c5e,#2563eb);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🅿</div>
            <h1 style="color:white;margin:0;font-size:1.3rem;letter-spacing:1px;">XWZ PARKING SYSTEM</h1>
            <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:0.85rem;">Entry Ticket</p>
          </div>
          <div style="background:white;border-radius:0 0 12px 12px;padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Ticket #</td>
                <td style="padding:10px 0;color:#1e293b;font-weight:700;text-align:right;">${ticket.ticketNumber}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Plate Number</td>
                <td style="padding:10px 0;text-align:right;"><span style="background:#1e293b;color:white;padding:3px 10px;border-radius:4px;font-family:monospace;font-weight:700;letter-spacing:1px;">${ticket.plateNumber}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Parking</td>
                <td style="padding:10px 0;color:#1e293b;font-weight:600;text-align:right;">${ticket.parkingName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Location</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">${ticket.location}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Entry Time</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">${new Date(ticket.entryDateTime).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Rate</td>
                <td style="padding:10px 0;color:#1e293b;font-weight:600;text-align:right;">RWF ${ticket.feePerHour.toLocaleString()}/hr</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:14px;background:#f0f4f8;border-radius:8px;font-size:0.8rem;color:#64748b;text-align:center;">
              Please keep this ticket. You will need it when exiting the parking.
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:0.75rem;margin-top:16px;">XWZ LTD — Smart Parking Management, Kigali</p>
        </div>
      `,
    });
    logger.info(`Ticket email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send ticket email to ${to}: ${err.message}`);
  }
};

const sendBillEmail = async ({ to, bill }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email credentials not configured — skipping bill email');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"XWZ Parking System" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🧾 Parking Bill — ${bill.billNumber} — RWF ${bill.totalAmount.toLocaleString()}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#f0f4f8;padding:24px;">
          <div style="background:linear-gradient(135deg,#1a3c5e,#2563eb);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🧾</div>
            <h1 style="color:white;margin:0;font-size:1.3rem;letter-spacing:1px;">XWZ PARKING SYSTEM</h1>
            <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:0.85rem;">Exit Bill</p>
          </div>
          <div style="background:white;border-radius:0 0 12px 12px;padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Bill #</td>
                <td style="padding:10px 0;color:#1e293b;font-weight:700;text-align:right;">${bill.billNumber}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Plate Number</td>
                <td style="padding:10px 0;text-align:right;"><span style="background:#1e293b;color:white;padding:3px 10px;border-radius:4px;font-family:monospace;font-weight:700;letter-spacing:1px;">${bill.plateNumber}</span></td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Parking</td>
                <td style="padding:10px 0;color:#1e293b;font-weight:600;text-align:right;">${bill.parkingCode}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Entry Time</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">${new Date(bill.entryDateTime).toLocaleString()}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Exit Time</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">${new Date(bill.exitDateTime).toLocaleString()}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Duration</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">${bill.durationMinutes} min (${bill.durationHours} hrs)</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;font-weight:500;">Rate</td>
                <td style="padding:10px 0;color:#1e293b;text-align:right;">RWF ${bill.feePerHour.toLocaleString()}/hr</td>
              </tr>
            </table>
            <div style="margin-top:16px;padding:16px 20px;background:linear-gradient(135deg,#1a3c5e,#2563eb);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
              <span style="color:rgba(255,255,255,0.85);font-size:0.9rem;font-weight:500;">Total Amount</span>
              <span style="color:white;font-size:1.3rem;font-weight:700;">RWF ${bill.totalAmount.toLocaleString()}</span>
            </div>
            <div style="margin-top:16px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:0.8rem;color:#166534;text-align:center;">
              Thank you for using XWZ Parking. Drive safely!
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:0.75rem;margin-top:16px;">XWZ LTD — Smart Parking Management, Kigali</p>
        </div>
      `,
    });
    logger.info(`Bill email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send bill email to ${to}: ${err.message}`);
  }
};

module.exports = { sendTicketEmail, sendBillEmail };
