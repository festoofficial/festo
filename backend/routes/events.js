const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const qrUploadDir = path.join(__dirname, '..', 'uploads', 'qr');
if (!fs.existsSync(qrUploadDir)) {
  fs.mkdirSync(qrUploadDir, { recursive: true });
}

const qrStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, qrUploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const qrUpload = multer({ storage: qrStorage });

// Get all events
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [events] = await connection.query(
      'SELECT e.*, u.name as organizer_name, u.college as college FROM events e LEFT JOIN users u ON e.organizer_id = u.id ORDER BY e.date DESC'
    );
    connection.release();

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// Get event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const connection = await pool.getConnection();
    
    const [events] = await connection.query(
      'SELECT e.*, u.name as organizer_name, u.college as college FROM events e LEFT JOIN users u ON e.organizer_id = u.id WHERE e.id = ?',
      [eventId]
    );

    connection.release();

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event: events[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

// Create event (Organizer only)
router.post('/', async (req, res) => {
  try {
    const { organizer_id, name, category, description, date, time, venue, fee, max_participants } = req.body;

    if (!organizer_id || !name || !date || !max_participants) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    const { upi_id, bank_details } = req.body;

    const [result] = await connection.query(
      'INSERT INTO events (organizer_id, name, category, description, date, time, venue, fee, max_participants, upi_id, bank_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [organizer_id, name, category, description, date, time, venue, fee || 0, max_participants, upi_id || null, bank_details || null]
    );

    connection.release();

    res.status(201).json({ 
      message: 'Event created successfully',
      eventId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Update event
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, category, description, date, time, venue, fee, max_participants, upi_id, bank_details } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE events SET name = ?, category = ?, description = ?, date = ?, time = ?, venue = ?, fee = ?, max_participants = ?, upi_id = ?, bank_details = ? WHERE id = ?',
      [name, category, description, date, time, venue, fee, max_participants, upi_id || null, bank_details || null, eventId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
});

// Delete event
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'DELETE FROM events WHERE id = ?',
      [eventId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
});

// Get events by organizer
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    const connection = await pool.getConnection();
    
    const [events] = await connection.query(
      'SELECT e.*, u.college as college FROM events e LEFT JOIN users u ON e.organizer_id = u.id WHERE e.organizer_id = ? ORDER BY e.date DESC',
      [organizerId]
    );

    connection.release();

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch organizer events', error: error.message });
  }
});

// Upload QR code for an event
router.post('/:eventId/upload-qr', qrUpload.single('qr'), async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'QR file is required' });
    }

    const qrUrl = `/uploads/qr/${req.file.filename}`;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE events SET qr_code_url = ? WHERE id = ?',
      [qrUrl, eventId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'QR code uploaded successfully', qr_code_url: qrUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload QR code', error: error.message });
  }
});

module.exports = router;
