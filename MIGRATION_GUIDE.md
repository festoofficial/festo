# React Migration Guide - Festo Application

## Overview
The Festo college event management platform has been successfully migrated from a traditional HTML/CSS/JavaScript structure to a modern React-based single-page application (SPA). All functionality, styling, and user experience have been preserved and enhanced.

---

## Architecture

### Before (Original)
```
├── index.html (home page)
├── organizer-dashboard.html
├── participant-dashboard.html
├── styles.css (main styles)
├── dashboard.css (dashboard styles)
├── script.js (home page logic)
├── dashboard.js (organizer logic)
└── participant-dashboard.js (participant logic)
```

### After (React)
```
src/
├── App.js (root component with routing)
├── index.js (React entry point)
├── index.css (all consolidated styles)
├── components/ (reusable components)
├── pages/ (page-level components)
├── context/ (state management)
├── data/ (constants and data)
└── utils/ (helper functions)
```

---

## Component Mapping

### Pages
| Original File | React Component | Path |
|---|---|---|
| index.html | Home.js | src/pages/Home.js |
| organizer-dashboard.html | OrganizerDashboard.js | src/pages/OrganizerDashboard.js |
| participant-dashboard.html | ParticipantDashboard.js | src/pages/ParticipantDashboard.js |

### Shared Components
| Component | File | Purpose |
|---|---|---|
| Navbar | src/components/Navbar.js | Navigation with role-based menu |
| Footer | src/components/Footer.js | Application footer |
| EventCard | src/components/EventCard.js | Reusable event display card |
| PrivateRoute | src/components/PrivateRoute.js | Route protection wrapper |

### State & Data Management
| Module | File | Purpose |
|---|---|---|
| AuthContext | src/context/AuthContext.js | User authentication & state |
| eventsData | src/data/eventsData.js | Event constants & data |
| helpers | src/utils/helpers.js | Utility functions |

---

## Feature Implementation

### Authentication Flow
1. User navigates to home page
2. Clicks login or signup
3. AuthContext handles form submission
4. User data stored in localStorage
5. User redirected based on role (organizer/participant)

```javascript
// Example authentication flow
const { login } = useAuth();
login(email, password);  // Handles user lookup or creation
```

### Routing
- `/` - Home page with event listings
- `/organizer-dashboard` - Organizer management interface
- `/participant-dashboard` - Participant event interface

Protected routes automatically redirect unauthorized users to home page.

### State Management
- **User State:** Managed by AuthContext with useAuth hook
- **Event State:** Local component state with useState
- **Persistence:** localStorage for user data and organizer events

---

## Styling System

### CSS Architecture
- **Design System:** CSS Custom Properties (--primary-color, etc.)
- **Responsive:** Mobile-first with media queries
- **Structure:** Organized by component and page

### Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Key Style Variables
```css
--primary-color: #6366f1
--secondary-color: #ec4899
--success-color: #10b981
--danger-color: #ef4444
--text-dark: #1e293b
--text-light: #64748b
```

---

## Key Features

### Home Page (Home.js)
- Hero section with CTAs
- Feature highlights
- Event listings with search/filter
- About section
- Login/Signup forms with role selection

### Organizer Dashboard (OrganizerDashboard.js)
- Statistics overview
- Event management (CRUD operations)
- Participant tracking
- Revenue analytics
- Event export to CSV
- Profile management

### Participant Dashboard (ParticipantDashboard.js)
- Registered events view
- Event discovery/browsing
- Search and filtering
- Profile view
- Quick action buttons

---

## Data Flow

### Event Data
```
eventsData.js (constant data)
    ↓
Home.js / OrganizerDashboard.js (consume)
    ↓
EventCard.js (display)
```

### User Data
```
Login/Signup Form
    ↓
AuthContext (login/signup/logout)
    ↓
localStorage (persistence)
    ↓
useAuth hook (access from components)
```

---

## Development Workflow

### Adding a New Feature
1. Create component in `src/components/` or `src/pages/`
2. Import and use in parent component
3. Add routing if it's a page in `App.js`
4. Add styles to `src/index.css`
5. Test responsiveness

### Modifying Authentication
1. Edit `src/context/AuthContext.js`
2. Update login/signup logic
3. Modify user data structure if needed
4. Update components using `useAuth()`

### Updating Styles
1. Find relevant section in `src/index.css`
2. Make changes following existing patterns
3. Test responsive behavior
4. Check mobile/tablet/desktop views

---

## Performance Considerations

### Optimizations Made
- Component splitting for reusability
- Lazy loading support ready
- CSS organization for minimal repaints
- localStorage caching

### Future Improvements
- Code splitting with React.lazy()
- Memoization with React.memo()
- useCallback for event handlers
- useMemo for expensive calculations

---

## Browser Compatibility

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Debugging Tips

### Check Component State
```javascript
const { user } = useAuth();
console.log('Current user:', user);
```

### Verify Routing
Check browser URL and React Router DevTools extension

### CSS Issues
- Check if class names match in HTML and CSS
- Use browser DevTools to inspect computed styles
- Verify media query breakpoints

### Data Issues
- Check localStorage in DevTools Application tab
- Verify eventsData imports
- Check component prop drilling

---

## Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `build/` folder ready for deployment.

### Environment Setup
- Set NODE_ENV to production
- Configure any API endpoints
- Update public/index.html metadata if needed

---

## Migration Benefits

✅ **Code Organization:** Modular component structure
✅ **Reusability:** Components can be reused across pages
✅ **Maintainability:** Easier to locate and update features
✅ **State Management:** Centralized auth context
✅ **Scalability:** Ready for backend integration
✅ **Performance:** Optimized rendering with React
✅ **Developer Experience:** Better debugging tools

---

## Common Tasks

### Adding a New Event Category
```javascript
// In OrganizerDashboard.js form
<option value="NewCategory">New Category</option>
```

### Changing Primary Color
```css
/* In src/index.css */
--primary-color: #newcolor;
```

### Adding Navigation Link
```javascript
// In Navbar.js
<li><a onClick={() => navigate('/new-route')}>New Link</a></li>
```

### Creating a New Page
1. Create file in `src/pages/NewPage.js`
2. Add route in `App.js`
3. Import and add Route component

---

## Troubleshooting

### Page Not Loading
- Check browser console for errors
- Verify route in App.js
- Check component exports

### Styling Not Applied
- Verify className matches CSS
- Check CSS file is imported
- Use browser DevTools to debug

### Authentication Not Working
- Check localStorage in DevTools
- Verify AuthContext provider wraps app
- Check useAuth() hook usage

### Events Not Displaying
- Verify eventsData import
- Check state initialization
- Verify map function in JSX

---

## Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Last Updated:** January 22, 2026
**Version:** 1.0.0
**Status:** Production Ready
