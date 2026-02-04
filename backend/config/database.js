const mysql = require('mysql2/promise');
require('dotenv').config();

const ssl =
  String(process.env.DB_SSL || '').toLowerCase() === 'true'
    ? { rejectUnauthorized: true }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'festo_db',
  port: process.env.DB_PORT || 3306,
  ...(ssl ? { ssl } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
