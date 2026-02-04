const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email service (using Gmail example)
// For production, use a proper email service like SendGrid, AWS SES, etc.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'festoverify@gmail.com',
      to: email,
      subject: 'Festo - Your OTP for Signup',
      html: `
        <h2>Welcome to Festo!</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© 2026 Festo - College Event Management Platform</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

async function sendEmailChangeOTP(email, otp, label) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'festoverify@gmail.com',
      to: email,
      subject: `Festo - OTP to confirm ${label} email`,
      html: `
        <h2>Confirm Your Email Change</h2>
        <p>Use this One-Time Password (OTP) to verify your ${label} email:</p>
        <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© 2026 Festo - College Event Management Platform</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: `OTP sent to your ${label} email` };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

module.exports = { sendOTPEmail, sendEmailChangeOTP };
