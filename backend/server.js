const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const pool = require('./config/database');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(cors({
  origin: allowedOrigins || true,
  credentials: true
}));
app.use(express.json());
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const buildDir = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
}

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const otpRoutes = require('./routes/otp');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/otp', otpRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Database connection test
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1');
    connection.release();
    res.json({ message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

if (fs.existsSync(buildDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const ensureEmailChangeTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS email_change_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      old_email VARCHAR(255) NOT NULL,
      new_email VARCHAR(255) NOT NULL,
      otp_old VARCHAR(6) NOT NULL,
      otp_new VARCHAR(6) NOT NULL,
      verified_old BOOLEAN DEFAULT FALSE,
      verified_new BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  await pool.query(createTableQuery);
};

const ensurePaymentColumns = async () => {
  const safeAdd = async (query) => {
    try {
      await pool.query(query);
    } catch (err) {
      const msg = String(err.message || '');
      if (err.code !== 'ER_DUP_FIELDNAME' && !msg.includes('Duplicate column')) {
        throw err;
      }
    }
  };

  await safeAdd('ALTER TABLE events ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)');
  await safeAdd('ALTER TABLE events ADD COLUMN IF NOT EXISTS bank_details TEXT');
  await safeAdd('ALTER TABLE events ADD COLUMN IF NOT EXISTS qr_code_url VARCHAR(255)');
  await safeAdd('ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(255)');
  await safeAdd('ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255)');
};

// Test database connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✓ Database connected successfully');
    conn.release();
    return ensureEmailChangeTable().then(() => ensurePaymentColumns());
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.error('Database config:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'festo_db',
      port: process.env.DB_PORT || 3306
    });
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Database Host: ${process.env.DB_HOST}`);
});
