import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { eventsAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { user, login, sendOTP, verifyOTPAndCreateAccount } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Signup states
  const [signupStep, setSignupStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    college: '', 
    role: '' 
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading_signup, setLoadingSignup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        // Fall back to empty array if API fails
        setEvents([]);
      } finally {
        // no-op
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/participant-dashboard');
      }
    }
  }, [user, navigate]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await login(loginData.email, loginData.password);
      setLoginData({ email: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!signupData.name || !signupData.email || !signupData.college || !signupData.role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoadingSignup(true);
      await sendOTP(signupData.email, signupData.name, signupData.college, signupData.role);
      setSignupStep(2);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoadingSignup(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signupData.password || signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoadingSignup(true);
      await verifyOTPAndCreateAccount(signupData.email, otp, signupData.password);
      setSignupData({ name: '', email: '', password: '', college: '', role: '' });
      setOtp('');
      setSignupStep(1);
      setActiveTab('login');
      setSuccess('OTP verified. Account created successfully. Please log in.');
    } catch (err) {
      setError(err.message || 'Incorrect or expired OTP. Please try again.');
    } finally {
      setLoadingSignup(false);
    }
  };

  const resetSignup = () => {
    setSignupStep(1);
    setSignupData({ name: '', email: '', password: '', college: '', role: '' });
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleViewDetails = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleRegisterFromLanding = (eventId) => {
    if (!user) {
      setError('Please login to register for events.');
      setSuccess('');
      setActiveTab('login');
      document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    // If already logged in, send user to their dashboard
    if (user.role === 'organizer') {
      navigate('/organizer-dashboard');
    } else {
      navigate('/participant-dashboard');
    }
  };

  if (user) {
    return null;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Discover, Register, Celebrate</h2>
          <p>Your ultimate platform for college events management</p>
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => document.getElementById('login').scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Events
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Festo?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Event Management</h3>
              <p>Create and manage college events with an intuitive interface</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Participant Tracking</h3>
              <p>Track registrations and manage participants effortlessly</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payments</h3>
              <p>Safe and secure payment processing for registrations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Winners & Certificates</h3>
              <p>Announce winners and generate digital certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="events-section">
        <div className="container">
          <h2>Upcoming Events</h2>
          <div className="events-grid">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
                onRegister={handleRegisterFromLanding}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About Festo</h2>
          <div className="about-content">
            <p>Festo is a centralized college event management platform designed to streamline the creation, registration, and management of college events. With two distinct user roles - Organizers and Participants - Festo provides a seamless experience for everyone.</p>
            <div className="about-grid">
              <div className="about-card">
                <h3>For Organizers</h3>
                <p>Create events, manage participants, track revenue, and generate certificates with ease</p>
              </div>
              <div className="about-card">
                <h3>For Participants</h3>
                <p>Discover events, register quickly, make secure payments, and track your participation history</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="login-section">
        <div className="container">
          <div className="login-container">
            <h2>Get Started</h2>
            <div className="login-tabs">
              <button
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); resetSignup(); }}
              >
                Login
              </button>
              <button
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); }}
              >
                Sign Up
              </button>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>{error}</div>}
            {success && <div style={{ color: '#065f46', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem' }}>{success}</div>}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form active-tab">
                <h3>Login to Your Account</h3>
                <div className="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Login</button>
                <p className="form-text">Don't have an account? <button type="button" className="link-button" onClick={() => { setActiveTab('signup'); setError(''); setSuccess(''); resetSignup(); }}>Sign up here</button></p>
              </form>
            )}

            {/* Signup Form - Step 1: Email & Details */}
            {activeTab === 'signup' && signupStep === 1 && (
              <form onSubmit={handleSendOTP} className="auth-form active-tab">
                <h3>Create Your Account</h3>
                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    type="text"
                    id="signup-name"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-college">College Name</label>
                  <input
                    type="text"
                    id="signup-college"
                    name="college"
                    value={signupData.college}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="signup-role">I am a:</label>
                  <select
                    id="signup-role"
                    name="role"
                    value={signupData.role}
                    onChange={handleSignupChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="organizer">Organizer (College Admin)</option>
                    <option value="participant">Participant</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading_signup}>
                  {loading_signup ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
                <p className="form-text">Already have an account? <button type="button" className="link-button" onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); resetSignup(); }}>Login here</button></p>
              </form>
            )}

            {/* Signup Form - Step 2: OTP & Password */}
            {activeTab === 'signup' && signupStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="auth-form active-tab">
                <h3>Verify & Create Password</h3>
                <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#059669' }}>
                  <p>✓ OTP sent to {signupData.email}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="signup-otp">6-Digit OTP</label>
                  <input
                    type="text"
                    id="signup-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>Check your email for the OTP (expires in 10 minutes)</small>
                </div>
                <div className="form-group">
                  <label htmlFor="signup-password">Create Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading_signup}>
                  {loading_signup ? 'Creating Account...' : 'Verify & Create Account'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-block" 
                  onClick={() => setSignupStep(1)}
                  style={{ marginTop: '0.5rem' }}
                >
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '640px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{selectedEvent.name}</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>{selectedEvent.category} • {selectedEvent.college}</p>
            <p style={{ marginBottom: '1rem' }}>{selectedEvent.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div><strong>Time:</strong> {selectedEvent.time || 'TBA'}</div>
              <div><strong>Venue:</strong> {selectedEvent.venue || 'TBA'}</div>
              <div><strong>Fee:</strong> ₹{selectedEvent.fee}</div>
              <div><strong>Slots:</strong> {selectedEvent.registered}/{selectedEvent.max_participants}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => handleRegisterFromLanding(selectedEvent.id)}>Register</button>
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
