# Festo Backend

Backend server for the Festo college event management platform.

## Setup Instructions

### 1. Install MySQL
Make sure MySQL is installed and running on your system.

### 2. Create Database
```sql
CREATE DATABASE festo_db;
```

### 3. Import Database Schema
```bash
mysql -u root festo_db < backend/db_schema.sql
```

### 4. Install Dependencies
```bash
cd backend
npm install
```

### 5. Configure Environment Variables
Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=festo_db
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

### 6. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:userId` - Get user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:eventId` - Get event details
- `POST /api/events` - Create new event
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event
- `GET /api/events/organizer/:organizerId` - Get organizer's events

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/event/:eventId` - Get event registrations
- `GET /api/registrations/participant/:participantId` - Get participant registrations
- `PUT /api/registrations/:registrationId` - Update registration
- `DELETE /api/registrations/:registrationId` - Cancel registration

## Test Database Connection
```bash
curl http://localhost:5000/api/test-db
```
