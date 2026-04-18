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

  const handleDashboardClick = () => {
    if (user?.role === 'organizer') {
      navigate('/organizer-dashboard');
    } else if (user?.role === 'participant') {
      navigate('/participant-dashboard');
    }
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
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 20px' }}>
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
        <ul className="nav-menu">
          {!user && <li><a onClick={() => navigate('/')}>Home</a></li>}
          {!user && <li><a onClick={() => { navigate('/'); handleScroll('events'); }}>Events</a></li>}
          {!user && <li><a onClick={() => { navigate('/'); handleScroll('about'); }}>About</a></li>}
          
          {user && user.role === 'participant' && (
            <>
              <li><a onClick={handleDashboardClick} className={isDashboard ? 'nav-active' : ''}>Dashboard</a></li>
            </>
          )}

          {user && user.role === 'organizer' && (
            <>
              <li><a onClick={handleDashboardClick} className={isDashboard ? 'nav-active' : ''}>Dashboard</a></li>
            </>
          )}

          {user && (
            <li><button className="btn btn-primary" onClick={handleLogout}>Logout</button></li>
          )}

          {!user && (
            <li><a onClick={() => { navigate('/'); handleScroll('login'); }}>Login</a></li>
          )}
        </ul>
      </div>
    </nav>
  );
};


export default Navbar;
