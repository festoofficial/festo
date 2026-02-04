const pool = require('./config/database');

async function createOTPTable() {
  try {
    const connection = await pool.getConnection();
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        name VARCHAR(255),
        college VARCHAR(255),
        role ENUM('organizer', 'participant'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        verified BOOLEAN DEFAULT FALSE
      )
    `;
    
    await connection.query(createTableSQL);
    connection.release();
    
    console.log('✓ OTP table created successfully');
  } catch (error) {
    console.error('Error creating OTP table:', error.message);
  }
}

createOTPTable();
