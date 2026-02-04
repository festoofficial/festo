const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailChangeOTP } = require('../services/emailService');

// User Registration
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, college, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, college, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, college || null, role]
    );

    connection.release();

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    connection.release();

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, name, email, college, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, college, current_password, new_password } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const connection = await pool.getConnection();

    let hashedPassword = null;
    if (new_password && new_password.trim().length > 0) {
      if (!current_password || current_password.trim().length === 0) {
        connection.release();
        return res.status(400).json({ message: 'Current password is required' });
      }
      if (new_password.length < 6) {
        connection.release();
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const [existingUsers] = await connection.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (existingUsers.length === 0) {
        connection.release();
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(current_password, existingUsers[0].password);
      if (!isPasswordValid) {
        connection.release();
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      hashedPassword = await bcrypt.hash(new_password, 10);
    }

    if (hashedPassword) {
      await connection.query(
        'UPDATE users SET name = ?, college = ?, password = ? WHERE id = ?',
        [name, college || null, hashedPassword, userId]
      );
    } else {
      await connection.query(
        'UPDATE users SET name = ?, college = ? WHERE id = ?',
        [name, college || null, userId]
      );
    }

    const [users] = await connection.query(
      'SELECT id, name, email, college, role FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Request email change (send OTP to old and new email)
router.post('/email-change/request', async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    if (!userId || !newEmail) {
      return res.status(400).json({ message: 'User ID and new email are required' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    const oldEmail = users[0].email;
    if (oldEmail.toLowerCase() === newEmail.toLowerCase()) {
      connection.release();
      return res.status(400).json({ message: 'New email must be different from current email' });
    }

    const [emailInUse] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [newEmail]
    );

    if (emailInUse.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otpOld = Math.floor(100000 + Math.random() * 900000).toString();
    const otpNew = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await connection.query(
      'DELETE FROM email_change_requests WHERE user_id = ?',
      [userId]
    );

    await connection.query(
      'INSERT INTO email_change_requests (user_id, old_email, new_email, otp_old, otp_new, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, oldEmail, newEmail, otpOld, otpNew, expiresAt]
    );

    const oldEmailResult = await sendEmailChangeOTP(oldEmail, otpOld, 'current');
    const newEmailResult = await sendEmailChangeOTP(newEmail, otpNew, 'new');

    if (!oldEmailResult.success || !newEmailResult.success) {
      await connection.query(
        'DELETE FROM email_change_requests WHERE user_id = ?',
        [userId]
      );
      connection.release();
      return res.status(500).json({ message: 'Failed to send OTP to emails. Please try again.' });
    }

    connection.release();
    res.json({ message: 'OTPs sent to current and new email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request email change', error: error.message });
  }
});

// Verify OTP for current email
router.post('/email-change/verify-old', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT id, otp_old, verified_old, expires_at FROM email_change_requests WHERE user_id = ? AND verified_old = FALSE',
      [userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No pending email change request found' });
    }

    const reqRow = rows[0];
    if (new Date(reqRow.expires_at) <= new Date()) {
      await connection.query('DELETE FROM email_change_requests WHERE id = ?', [reqRow.id]);
      connection.release();
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }

    if (reqRow.otp_old !== otp) {
      connection.release();
      return res.status(400).json({ message: 'Invalid OTP for current email' });
    }

    await connection.query(
      'UPDATE email_change_requests SET verified_old = TRUE WHERE id = ?',
      [reqRow.id]
    );

    connection.release();
    res.json({ message: 'Current email verified. Please verify new email.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify current email OTP', error: error.message });
  }
});

// Verify OTP for new email and apply change
router.post('/email-change/verify-new', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT id, new_email, otp_new, verified_old, expires_at FROM email_change_requests WHERE user_id = ? AND verified_new = FALSE',
      [userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No pending email change request found' });
    }

    const reqRow = rows[0];
    if (!reqRow.verified_old) {
      connection.release();
      return res.status(400).json({ message: 'Current email is not verified yet' });
    }

    if (new Date(reqRow.expires_at) <= new Date()) {
      await connection.query('DELETE FROM email_change_requests WHERE id = ?', [reqRow.id]);
      connection.release();
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }

    if (reqRow.otp_new !== otp) {
      connection.release();
      return res.status(400).json({ message: 'Invalid OTP for new email' });
    }

    const [emailInUse] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [reqRow.new_email]
    );
    if (emailInUse.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already registered' });
    }

    await connection.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [reqRow.new_email, userId]
    );

    await connection.query(
      'DELETE FROM email_change_requests WHERE id = ?',
      [reqRow.id]
    );

    const [users] = await connection.query(
      'SELECT id, name, email, college, role FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    res.json({ message: 'Email updated successfully', user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify new email OTP', error: error.message });
  }
});

module.exports = router;
