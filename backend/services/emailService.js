const nodemailer = require('nodemailer');
const https = require('https');
require('dotenv').config();

// Configure email service (SMTP)
// Use Brevo API (recommended) or MailerSend API; SMTP is a fallback.
const smtpHost = process.env.SMTP_HOST || 'smtp.mailersend.net';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';

const brevoApiKey = process.env.BREVO_API_KEY;
const mailerSendToken = process.env.MAILERSEND_API_TOKEN;
const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@festo.com';
const emailFromName = process.env.EMAIL_FROM_NAME || 'Festo';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  pool: true,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

const sendViaBrevoApi = (payload) => new Promise((resolve, reject) => {
  const body = JSON.stringify(payload);
  const req = https.request(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, message: 'OTP sent to your email' });
        } else {
          reject(new Error(`Brevo API error (${res.statusCode}): ${data}`));
        }
      });
    }
  );

  req.on('error', reject);
  req.on('timeout', () => {
    req.destroy(new Error('Brevo API request timeout'));
  });

  req.write(body);
  req.end();
});

const sendViaMailerSendApi = (payload) => new Promise((resolve, reject) => {
  const body = JSON.stringify(payload);
  const req = https.request(
    'https://api.mailersend.com/v1/email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailerSendToken}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 15000
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, message: 'OTP sent to your email' });
        } else {
          reject(new Error(`MailerSend API error (${res.statusCode}): ${data}`));
        }
      });
    }
  );

  req.on('error', reject);
  req.on('timeout', () => {
    req.destroy(new Error('MailerSend API request timeout'));
  });

  req.write(body);
  req.end();
});

async function sendOTPEmail(email, otp) {
  try {
    const subject = 'Festo - Your OTP for Signup';
    const html = `
      <h2>Welcome to Festo!</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">© 2026 Festo - College Event Management Platform</p>
    `;

    if (brevoApiKey) {
      await sendViaBrevoApi({
        sender: { name: emailFromName, email: emailFrom },
        to: [{ email }],
        subject,
        htmlContent: html,
        textContent: `Your OTP is ${otp}. It expires in 10 minutes.`
      });
    } else if (mailerSendToken) {
      await sendViaMailerSendApi({
        from: { email: emailFrom, name: emailFromName },
        to: [{ email }],
        subject,
        html,
        text: `Your OTP is ${otp}. It expires in 10 minutes.`
      });
    } else {
      const mailOptions = { from: emailFrom, to: email, subject, html };
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    }
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

async function sendEmailChangeOTP(email, otp, label) {
  try {
    const subject = `Festo - OTP to confirm ${label} email`;
    const html = `
      <h2>Confirm Your Email Change</h2>
      <p>Use this One-Time Password (OTP) to verify your ${label} email:</p>
      <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">© 2026 Festo - College Event Management Platform</p>
    `;

    if (brevoApiKey) {
      await sendViaBrevoApi({
        sender: { name: emailFromName, email: emailFrom },
        to: [{ email }],
        subject,
        htmlContent: html,
        textContent: `Your OTP is ${otp}. It expires in 10 minutes.`
      });
    } else if (mailerSendToken) {
      await sendViaMailerSendApi({
        from: { email: emailFrom, name: emailFromName },
        to: [{ email }],
        subject,
        html,
        text: `Your OTP is ${otp}. It expires in 10 minutes.`
      });
    } else {
      const mailOptions = { from: emailFrom, to: email, subject, html };
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    }
    return { success: true, message: `OTP sent to your ${label} email` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

module.exports = { sendOTPEmail, sendEmailChangeOTP };
