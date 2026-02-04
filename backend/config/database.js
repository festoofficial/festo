const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const shouldUseSSL =
  String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
  /tidbcloud\.com$/i.test(host);

let ssl;
if (shouldUseSSL) {
  ssl = { rejectUnauthorized: true };
  if (process.env.DB_SSL_CA) {
    ssl.ca = fs.readFileSync(process.env.DB_SSL_CA, 'utf8');
  }
}

const pool = mysql.createPool({
  host,
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
