# 🎓 Festo - College Event Management Platform

A modern, responsive web application for managing college events with role-based access for Organizers and Participants.

## 🌟 Features

### General Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI** - Clean, professional interface with smooth animations
- **Authentication System** - Login and signup with role selection
- **Event Discovery** - Browse and search for events across colleges

### For Organizers (College Admins)
- **Dashboard Overview** - View stats: total events, registrations, and revenue
- **Event Management** - Create, edit, and manage events
- **Participant Tracking** - View and export participant lists
- **Revenue Analytics** - Track earnings and payment status
- **College Profile** - Manage college information

### For Participants
- **Personal Dashboard** - View upcoming and completed events
- **Event Registration** - Discover and register for events
- **Event History** - Track participation across events
- **Certificates** - Download participation and winner certificates
- **Payment History** - View registration and payment status
- **Profile Management** - Update personal information

## 📁 File Structure

```
festo/
├── index.html                    # Main landing page
├── organizer-dashboard.html     # Organizer dashboard
├── participant-dashboard.html   # Participant dashboard
├── styles.css                   # Main styles for landing page
├── dashboard.css                # Styles for dashboards
├── script.js                    # Landing page functionality
├── dashboard.js                 # Organizer dashboard logic
├── participant-dashboard.js     # Participant dashboard logic
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required (works with vanilla HTML, CSS, JavaScript)

### Installation

1. **Clone or Download the project**
   ```bash
   git clone <repository-url>
   cd festo
   ```

2. **Open in Browser**
   - Navigate to the project folder
   - Double-click `index.html` to open in your default browser
   - Or use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (with http-server)
     npm install -g http-server
     http-server
     ```

3. **Access the Application**
   - Landing Page: `http://localhost:8000` (or `file://` path)
   - Organizer Dashboard: Login with Organizer role
   - Participant Dashboard: Login with Participant role

## 💻 Usage

### Landing Page (`index.html`)
- Browse featured events
- View platform features
- Learn about Festo
- Login or sign up for an account

### Organizer Dashboard (`organizer-dashboard.html`)
1. **Login** as an Organizer (College Admin)
2. Access features from the sidebar:
   - **Dashboard** - View overview statistics
   - **My Events** - Manage all created events
   - **Create Event** - Add new events with details
   - **Participants** - View and export participant lists
   - **Revenue** - Track financial analytics
   - **Profile** - Edit college information

### Participant Dashboard (`participant-dashboard.html`)
1. **Login** as a Participant
2. Access features from the sidebar:
   - **Dashboard** - View personal statistics
   - **Registered Events** - See events you're signed up for
   - **Discover Events** - Browse and search available events
   - **Event History** - View past events and achievements
   - **Certificates** - Download earned certificates
   - **Profile** - Update personal information

## 🔐 Authentication

### Demo Credentials
The app uses localStorage for demo purposes. Create accounts through the signup form:
- **For Organizers**: Select "Organizer (College Admin)" role
- **For Participants**: Select "Participant" role

All data is stored in browser's localStorage and resets on browser cache clear.

## 🎨 Design Features

### Color Scheme
- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Danger: Red (#ef4444)

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1023px
- Mobile: Below 768px

### UI Components
- Navigation Bar (sticky)
- Hero Section with CTA buttons
- Feature Cards
- Event Cards with availability indicators
- Forms with validation
- Modals for event details
- Sidebar navigation for dashboards
- Data tables with filters
- Timeline views
- Certificate cards

## 🔧 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Vanilla JavaScript, no dependencies
- **localStorage API** - Client-side data persistence

## 📝 Sample Data

The application includes pre-loaded sample data:
- 6 sample events on landing page
- Multiple organizer events in organizer dashboard
- Participant registrations and history
- Certificate examples

## 🎯 Key Features Demonstrated

1. **Role-Based Access Control**
   - Different dashboards for Organizers and Participants
   - Restricted features based on user role

2. **Event Management**
   - Create and manage events
   - Track participant registrations
   - Monitor revenue and payments

3. **Search and Filter**
   - Search events by name, college, or category
   - Filter by event category
   - Filter participants by event

4. **Data Export**
   - Export participant lists as CSV
   - Download certificates

5. **Responsive Design**
   - Mobile-friendly navigation
   - Touch-friendly buttons
   - Optimized layouts for all screen sizes

6. **Dynamic Content**
   - Real-time stats updates
   - Live event registration
   - Dynamic form handling

## 📱 Browser Compatibility

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 Future Enhancements

- Backend API integration
- Real payment gateway integration
- Email notifications
- QR code generation for tickets
- Advanced analytics and reporting
- Multi-language support
- Dark mode toggle
- Real-time notifications

## ☁️ Deployment (Cloudflare + Railway)

### Frontend (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `build`
- Environment variables (Cloudflare Pages → Settings → Environment variables):
  - `REACT_APP_API_BASE_URL=https://<your-railway-backend-domain>/api`
  - `REACT_APP_FILE_BASE_URL=https://<your-railway-backend-domain>`

> SPA routing: `public/_redirects` is included for client-side routes (React Router) to work on refresh.

### Backend + Database (Railway)

- Deploy the repo to Railway using `railway.json` (backend-only build).
- Add a MySQL database on Railway and set these variables in the Railway service:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
  - `JWT_SECRET`
  - `CORS_ORIGIN=https://<your-cloudflare-pages-domain>` (comma-separated list supported)

> Note: uploads stored under `backend/uploads/` are ephemeral on most PaaS platforms unless you add persistent storage or switch to object storage.

### Initialize Database Schema (one-time)

This project does not auto-create all tables on first run. After your Railway MySQL is ready and your backend variables are set:

- From repo root (local machine):
  - `npm --prefix backend install`
  - `npm --prefix backend run init-db`
- Video streaming for virtual events

## 📞 Support

For issues or questions, please refer to the documentation or open an issue in the repository.

## 📄 License

This project is available for educational and commercial use.

---

**Created with ❤️ for College Event Management**

Festo - Discover, Register, Celebrate 🎓
