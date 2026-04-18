const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

require('dotenv').config();

function normalizeDatabaseName(name) {
  if (!name) return null;
  return String(name).trim();
}

async function resolveDatabaseName(connection, desiredName) {
  const desired = normalizeDatabaseName(desiredName);
  if (!desired) return null;

  const [rows] = await connection.query('SHOW DATABASES');
  const databases = rows.map((r) => String(r.Database));

  const exact = databases.find((d) => d === desired);
  if (exact) return exact;

  const desiredLower = desired.toLowerCase();
  const ci = databases.find((d) => d.toLowerCase() === desiredLower);
  if (ci) {
    console.warn(
      `DB_NAME "${desired}" not found, but "${ci}" exists. Using "${ci}".`
    );
    return ci;
  }

  return desired;
}

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbNameEnv = process.env.DB_NAME || 'railway';

  const shouldUseSSL =
    String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
    /tidbcloud\.com$/i.test(host);

  let ssl;
  if (shouldUseSSL) {
    const hasCA = Boolean(process.env.DB_SSL_CA);
    const rejectUnauthorizedEnv = String(
      process.env.DB_SSL_REJECT_UNAUTHORIZED || ''
    ).toLowerCase();
    const rejectUnauthorized = rejectUnauthorizedEnv === 'true' ? true : hasCA;

    ssl = { rejectUnauthorized };
    if (hasCA) {
      ssl.ca = fs.readFileSync(process.env.DB_SSL_CA, 'utf8');
    }
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    ...(ssl ? { ssl } : {}),
    multipleStatements: true,
  });

  try {
    const dbName = await resolveDatabaseName(connection, dbNameEnv);
    if (!dbName) {
      throw new Error('Missing DB_NAME');
    }

    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    } catch (err) {
      // Some managed providers restrict CREATE DATABASE; we'll just try to USE it.
      console.warn(`CREATE DATABASE skipped: ${err.message}`);
    }

    await connection.query(`USE \`${dbName}\``);

    const schemaPath = path.join(__dirname, '..', 'db_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schema);

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✓ Schema applied. Tables: ${tables.length}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('✗ Failed to initialize schema:', err.message);
  process.exit(1);
});

