const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { sendOTPEmail } = require('../services/emailService');

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, college, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const connection = await pool.getConnection();

    // Check if email already registered
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Check if there's an existing OTP for this email
    const [existingOTP] = await connection.query(
      'SELECT id FROM otp_verifications WHERE email = ? AND verified = FALSE',
      [email]
    );

    if (existingOTP.length > 0) {
      // Update existing OTP
      await connection.query(
        'UPDATE otp_verifications SET otp = ?, name = ?, college = ?, role = ?, expires_at = ? WHERE email = ?',
        [otp, name, college, role, expiresAt, email]
      );
    } else {
      // Create new OTP record
      await connection.query(
        'INSERT INTO otp_verifications (email, otp, name, college, role, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [email, otp, name, college, role, expiresAt]
      );
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      // Roll back OTP if email failed
      await connection.query(
        'DELETE FROM otp_verifications WHERE email = ? AND verified = FALSE',
        [email]
      );
      connection.release();
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    connection.release();

    res.json({
      message: 'OTP sent successfully',
      emailMessage: emailResult.message
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' });
    }

    const connection = await pool.getConnection();

    // Check if OTP is valid and not expired
    const [otpRecords] = await connection.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND verified = FALSE AND expires_at > NOW()',
      [email, otp]
    );

    if (otpRecords.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const otpRecord = otpRecords[0];

    // Mark OTP as verified
    await connection.query(
      'UPDATE otp_verifications SET verified = TRUE WHERE id = ?',
      [otpRecord.id]
    );

    connection.release();

    res.json({
      message: 'OTP verified successfully',
      verified: true,
      userData: {
        email: otpRecord.email,
        name: otpRecord.name,
        college: otpRecord.college,
        role: otpRecord.role
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

module.exports = router;
