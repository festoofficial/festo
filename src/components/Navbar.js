import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const isDashboard = location.pathname.includes('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleScroll = (elementId) => {
    if (location.pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isDashboard && user && (
            <button 
              className="navbar-hamburger"
              onClick={toggleSidebar}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              ☰
            </button>
          )}
          <div className="nav-brand">
            <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🎓 Festo</h1>
          </div>
        </div>
        <ul className={`nav-menu ${user ? 'nav-menu--auth' : ''}`}>
          {!user && <li><button type="button" className="nav-link" onClick={() => { navigate('/'); handleScroll('events'); }}>Events</button></li>}
          {!user && <li><button type="button" className="nav-link" onClick={() => { navigate('/'); handleScroll('about'); }}>About</button></li>}
          
          {user && user.role === 'participant' && null}

          {user && user.role === 'organizer' && null}

          {user && (
            <li><button className="btn btn-primary" onClick={handleLogout}>Logout</button></li>
          )}

          {!user && (
            <li><button type="button" className="nav-link" onClick={() => { navigate('/'); handleScroll('login'); }}>Login</button></li>
          )}
        </ul>
      </div>
    </nav>
  );
};


export default Navbar;
