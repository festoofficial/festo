const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const proofUploadDir = path.join(__dirname, '..', 'uploads', 'proofs');
if (!fs.existsSync(proofUploadDir)) {
  fs.mkdirSync(proofUploadDir, { recursive: true });
}

const proofStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, proofUploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const proofUpload = multer({ storage: proofStorage });

// Register participant for event
router.post('/', async (req, res) => {
  try {
    const { event_id, participant_id, payment_status, paid_amount, payment_proof_url, transaction_ref } = req.body;

    if (!event_id || !participant_id) {
      return res.status(400).json({ message: 'Event and participant IDs required' });
    }

    if (!payment_proof_url) {
      return res.status(400).json({ message: 'Payment proof is required for registration' });
    }

    const connection = await pool.getConnection();

    // Check if already registered
    const [existing] = await connection.query(
      'SELECT id FROM event_registrations WHERE event_id = ? AND participant_id = ?',
      [event_id, participant_id]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Register participant
    const normalizedStatus = payment_status || 'pending';
    const normalizedAmount = paid_amount || 0;

    const [result] = await connection.query(
      'INSERT INTO event_registrations (event_id, participant_id, payment_status, paid_amount, payment_proof_url, transaction_ref) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, participant_id, normalizedStatus, normalizedAmount, payment_proof_url || null, transaction_ref || null]
    );

    // Update registered count only if paid
    if (normalizedStatus === 'paid') {
      await connection.query(
        'UPDATE events SET registered = registered + 1 WHERE id = ?',
        [event_id]
      );
    }

    // Update revenue if paid
    if (normalizedStatus === 'paid' && normalizedAmount > 0) {
      await connection.query(
        'UPDATE events SET revenue = revenue + ? WHERE id = ?',
        [normalizedAmount, event_id]
      );
    }

    connection.release();

    res.status(201).json({ 
      message: 'Registration successful',
      registrationId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Get registrations for event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const connection = await pool.getConnection();
    
    const [registrations] = await connection.query(
      'SELECT er.*, u.name, u.email, e.name as event_name, e.date as event_date, e.fee as event_fee FROM event_registrations er JOIN users u ON er.participant_id = u.id JOIN events e ON er.event_id = e.id WHERE er.event_id = ?',
      [eventId]
    );

    connection.release();

    res.json({ registrations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
});

// Get registrations for participant
router.get('/participant/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const connection = await pool.getConnection();
    
    const [registrations] = await connection.query(
      'SELECT er.*, e.name as event_name, e.date, e.time, e.venue, e.category, e.description, e.fee, e.max_participants, e.registered, e.revenue FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.participant_id = ?',
      [participantId]
    );

    connection.release();

    res.json({ registrations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch participant registrations', error: error.message });
  }
});

// Update registration payment status
router.put('/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { payment_status, paid_amount } = req.body;

    const connection = await pool.getConnection();
    const [existingRows] = await connection.query(
      'SELECT event_id, payment_status, paid_amount FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    if (existingRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Registration not found' });
    }

    const existing = existingRows[0];
    const newStatus = payment_status || existing.payment_status;
    const newAmount = paid_amount !== undefined ? paid_amount : existing.paid_amount;

    const [result] = await connection.query(
      'UPDATE event_registrations SET payment_status = ?, paid_amount = ? WHERE id = ?',
      [newStatus, newAmount, registrationId]
    );

    const prevContribution = existing.payment_status === 'paid' ? existing.paid_amount : 0;
    const newContribution = newStatus === 'paid' ? newAmount : 0;
    const delta = newContribution - prevContribution;

    if (delta !== 0) {
      await connection.query(
        'UPDATE events SET revenue = revenue + ? WHERE id = ?',
        [delta, existing.event_id]
      );
    }

    const prevCount = existing.payment_status === 'paid' ? 1 : 0;
    const newCount = newStatus === 'paid' ? 1 : 0;
    const countDelta = newCount - prevCount;
    if (countDelta !== 0) {
      await connection.query(
        'UPDATE events SET registered = registered + ? WHERE id = ?',
        [countDelta, existing.event_id]
      );
    }

    connection.release();

    res.json({ message: 'Registration updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update registration', error: error.message });
  }
});

// Cancel registration
router.delete('/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;

    const connection = await pool.getConnection();
    
    // Get event_id before deletion
    const [registrations] = await connection.query(
      'SELECT event_id, payment_status, paid_amount FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    if (registrations.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Registration not found' });
    }

    const event_id = registrations[0].event_id;

    // Delete registration
    await connection.query(
      'DELETE FROM event_registrations WHERE id = ?',
      [registrationId]
    );

    // Update registered count if this registration was paid
    if (registrations[0].payment_status === 'paid') {
      await connection.query(
        'UPDATE events SET registered = registered - 1 WHERE id = ?',
        [event_id]
      );
    }

    // Update revenue if this registration was paid
    if (registrations[0].payment_status === 'paid' && registrations[0].paid_amount > 0) {
      await connection.query(
        'UPDATE events SET revenue = revenue - ? WHERE id = ?',
        [registrations[0].paid_amount, event_id]
      );
    }

    connection.release();

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel registration', error: error.message });
  }
});

// Upload payment proof for a registration
router.post('/upload-proof', proofUpload.single('proof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof file is required' });
    }
    const proofUrl = `/uploads/proofs/${req.file.filename}`;
    res.json({ message: 'Proof uploaded', payment_proof_url: proofUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload proof', error: error.message });
  }
});

module.exports = router;
