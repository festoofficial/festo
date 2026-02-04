# Festo - College Event Management Platform (React)

This is a React-based version of the Festo event management platform.

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed

### Installation & Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm build
   ```

## 📋 Features

### For All Users
- **Home Page**: Browse upcoming events with detailed information
- **Event Discovery**: Search and filter events by category
- **Responsive Design**: Works seamlessly on mobile and desktop

### Authentication
- **Sign Up**: Create account as Organizer or Participant
- **Login**: Secure login with role-based access
- **LocalStorage**: User data persists in browser

### For Organizers
- **Dashboard Overview**: View key metrics (events, registrations, revenue)
- **Event Management**: Create, edit, and delete events
- **Participant Tracking**: View all registered participants
- **Revenue Analytics**: Track earnings by event

### For Participants
- **My Events**: View registered events
- **Browse Events**: Discover and register for new events
- **Profile Management**: View and manage profile information

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: CSS3
- **Data Storage**: Browser LocalStorage

## 📁 Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Navbar.js
│   ├── Footer.js
│   ├── EventCard.js
│   └── PrivateRoute.js
├── pages/            # Page components
│   ├── Home.js
│   ├── OrganizerDashboard.js
│   └── ParticipantDashboard.js
├── context/          # React Context for state management
│   └── AuthContext.js
├── data/             # Static data
│   └── eventsData.js
├── App.js            # Main app component
└── index.js          # Entry point
```

## 🔐 Default Demo Users

### To test as Organizer:
- Email: `organizer@test.com`
- Password: `password123`

### To test as Participant:
- Email: `participant@test.com`
- Password: `password123`

Or sign up with any email to create a new account.

## 🎯 User Flows

### Organizer Flow
1. Sign up/Login as Organizer
2. View dashboard with event statistics
3. Manage events (CRUD operations)
4. Track participant registrations
5. View revenue analytics

### Participant Flow
1. Sign up/Login as Participant
2. Browse available events on home page
3. Register for events from dashboard
4. View registered events
5. Manage profile

## ✨ Key Features

- **Role-Based Access Control**: Different views for organizers and participants
- **Secure Authentication**: Protected routes using PrivateRoute component
- **Responsive UI**: Mobile-friendly design
- **Real-time Updates**: Instant feedback on user actions
- **Persistent Data**: User data stored in localStorage

## 📝 Notes

- This is a demo application using localStorage for data persistence
- In production, integrate with a backend API (Node.js, Python, etc.)
- Authentication should use secure methods like JWT tokens
- Payment processing should use payment gateways like Stripe or Razorpay

## 🚀 To Run the App

Simply execute in your terminal:
```bash
npm start
```

Your browser will automatically open to `http://localhost:3000`
