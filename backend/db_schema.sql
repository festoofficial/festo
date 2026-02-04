-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  college VARCHAR(255),
  role ENUM('organizer', 'participant') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- OTP Verification Table
CREATE TABLE otp_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  name VARCHAR(255),
  college VARCHAR(255),
  role ENUM('organizer', 'participant'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE
);

-- Events Table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organizer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  venue VARCHAR(255),
  fee DECIMAL(10, 2),
  max_participants INT,
  registered INT DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  upi_id VARCHAR(255),
  bank_details TEXT,
  qr_code_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event Registrations Table
CREATE TABLE event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  paid_amount DECIMAL(10, 2),
  payment_proof_url VARCHAR(255),
  transaction_ref VARCHAR(255),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, participant_id)
);

-- Participants Table (for organizer dashboard)
CREATE TABLE participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Email Change Requests Table
CREATE TABLE email_change_requests (
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
);
