import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/organizer-dashboard"
                  element={
                    <PrivateRoute requiredRole="organizer">
                      <OrganizerDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/participant-dashboard"
                  element={
                    <PrivateRoute requiredRole="participant">
                      <ParticipantDashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
