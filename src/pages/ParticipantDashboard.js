import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { authAPI, eventsAPI, registrationsAPI } from '../services/api';
import { FILE_BASE_URL } from '../config';

const ParticipantDashboard = () => {
  const { user, updateUser } = useAuth();
  const { sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('participantActiveTab_' + user?.email) || 'myEvents';
  });
  const [allEvents, setAllEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [registrationsMap, setRegistrationsMap] = useState({});
  
  const [profileForm, setProfileForm] = useState({ name: '', college: '', current_password: '', new_password: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [otpOld, setOtpOld] = useState('');
  const [otpNew, setOtpNew] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentEvent, setPaymentEvent] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      college: user?.college || '',
      current_password: '',
      new_password: ''
    });
  }, [user]);

  useEffect(() => {
    localStorage.setItem('participantActiveTab_' + user?.email, activeTab);
  }, [activeTab, user?.email]);

  // Fetch all events and user registrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all events
        const eventsData = await eventsAPI.getAll();
        setAllEvents(eventsData.events || []);

        // Fetch user's registrations
        if (user?.id) {
          const registrationsData = await registrationsAPI.getForParticipant(user.id);
          const registeredIds = registrationsData.registrations?.map(r => r.event_id) || [];
          const regMap = {};
          (registrationsData.registrations || []).forEach(r => {
            regMap[r.event_id] = r;
          });
          setRegisteredEventIds(registeredIds);
          setRegistrationsMap(regMap);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        // no-op
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const myEvents = allEvents.filter(event => registeredEventIds.includes(event.id));
  const browseEvents = allEvents.filter(event => !registeredEventIds.includes(event.id));

  const handleRegister = async (eventId) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    setPaymentEvent(event);
    setPaymentProof(null);
    setTransactionRef('');
    setPaymentMessage('');
    setPaymentModalOpen(true);
  };

  const handleSubmitPayment = async () => {
    if (!paymentEvent) return;
    if (!paymentProof) {
      setPaymentMessage('Please upload a payment proof screenshot.');
      return;
    }
    setPaymentLoading(true);
    setPaymentMessage('');
    try {
      const uploaded = await registrationsAPI.uploadProof(paymentProof);
      await registrationsAPI.register(paymentEvent.id, user.id, {
        paid_amount: paymentEvent.fee,
        payment_proof_url: uploaded.payment_proof_url,
        transaction_ref: transactionRef || null
      });
      setRegisteredEventIds([...registeredEventIds, paymentEvent.id]);
      setRegistrationsMap({
        ...registrationsMap,
        [paymentEvent.id]: { payment_status: 'pending' }
      });
      setPaymentModalOpen(false);
    } catch (err) {
      setPaymentMessage(err.message || 'Failed to submit payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const payload = {
        name: profileForm.name,
        college: profileForm.college
      };
      if (profileForm.new_password && profileForm.new_password.trim().length > 0) {
        payload.current_password = profileForm.current_password;
        payload.new_password = profileForm.new_password;
      }

      const result = await authAPI.updateProfile(user.id, payload);
      updateUser(result.user);
      setProfileForm({ ...profileForm, current_password: '', new_password: '' });
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileMessage(err.message || 'Failed to update profile.');
    }
  };

  const openEmailModal = () => {
    setEmailStep(1);
    setNewEmail('');
    setOtpOld('');
    setOtpNew('');
    setEmailMessage('');
    setEmailModalOpen(true);
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail) {
      setEmailMessage('Please enter a new email address.');
      return;
    }
    setEmailLoading(true);
    setEmailMessage('');
    try {
      await authAPI.requestEmailChange(user.id, newEmail);
      setEmailStep(1);
      setEmailMessage('OTP sent to your current email. Please verify.');
    } catch (err) {
      setEmailMessage(err.message || 'Failed to send OTPs.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOldEmail = async () => {
    if (!otpOld || otpOld.length !== 6) {
      setEmailMessage('Enter the 6-digit OTP sent to your current email.');
      return;
    }
    setEmailLoading(true);
    setEmailMessage('');
    try {
      await authAPI.verifyOldEmailOtp(user.id, otpOld);
      setEmailStep(2);
      setEmailMessage('Current email verified. Enter OTP sent to new email.');
    } catch (err) {
      setEmailMessage(err.message || 'Failed to verify current email.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyNewEmail = async () => {
    if (!otpNew || otpNew.length !== 6) {
      setEmailMessage('Enter the 6-digit OTP sent to your new email.');
      return;
    }
    setEmailLoading(true);
    setEmailMessage('');
    try {
      const result = await authAPI.verifyNewEmailOtp(user.id, otpNew);
      updateUser(result.user);
      setEmailModalOpen(false);
      setEmailMessage('');
    } catch (err) {
      setEmailMessage(err.message || 'Failed to verify new email.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className={activeTab === 'myEvents' ? 'active' : ''}>
            <button type="button" className="sidebar-link" onClick={() => { setActiveTab('myEvents'); }}>📋 My Events</button>
          </li>
          <li className={activeTab === 'browseEvents' ? 'active' : ''}>
            <button type="button" className="sidebar-link" onClick={() => { setActiveTab('browseEvents'); }}>🔍 Browse Events</button>
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''}>
            <button type="button" className="sidebar-link" onClick={() => { setActiveTab('profile'); }}>👤 Profile</button>
          </li>
        </ul>
      </div>

      <div className="dashboard-content">
        <h1>Welcome, {user?.name}!</h1>

        {/* My Events Tab */}
        {activeTab === 'myEvents' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Registered Events</h3>
                <div className="stat-value">{registeredEventIds.length}</div>
              </div>
              <div className="stat-card">
                <h3>Upcoming</h3>
                <div className="stat-value">
                  {myEvents.filter(e => new Date(e.date) > new Date()).length}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow)' }}>
              <h2>My Registered Events</h2>
              {myEvents.length > 0 ? (
                <div className="events-grid" style={{ marginTop: '1rem' }}>
                  {myEvents.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <span className="event-category">{event.category}</span>
                        <h3>{event.name}</h3>
                        <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.5rem' }}>{event.college}</p>
                      </div>
                      <div className="event-body">
                        <div className="event-info">
                          <span>📅 {formatDate(event.date)}</span>
                          <span>🕐 {event.time}</span>
                        </div>
                        <div className="event-info">
                          <span>📍 {event.venue}</span>
                        </div>
                        <div className="event-price">₹{event.fee}</div>
                        {(() => {
                          const status = registrationsMap[event.id]?.payment_status || 'pending';
                          const isPaid = status === 'paid';
                          return (
                            <div style={{
                              marginTop: '1rem',
                              padding: '1rem',
                              backgroundColor: isPaid ? '#ecfdf5' : '#fff7ed',
                              borderRadius: '0.5rem',
                              color: isPaid ? '#059669' : '#b45309',
                              fontWeight: '600'
                            }}>
                              {isPaid ? 'Payment Verified' : 'Payment Pending'}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>You haven't registered for any events yet.</p>
              )}
            </div>
          </>
        )}

        {/* Browse Events Tab */}
        {activeTab === 'browseEvents' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow)' }}>
            <h2>Browse Available Events</h2>
            <div className="events-grid" style={{ marginTop: '1rem' }}>
              {browseEvents.map(event => {
                const slotsFilled = (event.registered / event.max_participants) * 100;
                const slotsAvailable = event.max_participants - event.registered;

                return (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <span className="event-category">{event.category}</span>
                      <h3>{event.name}</h3>
                      <p style={{ opacity: 0.9, fontSize: '0.9rem', marginTop: '0.5rem' }}>{event.college}</p>
                    </div>
                    <div className="event-body">
                      <div className="event-info">
                        <span>📅 {formatDate(event.date)}</span>
                        <span>🕐 {event.time}</span>
                      </div>
                      <div className="event-info">
                        <span>📍 {event.venue}</span>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-price">₹{event.fee}</div>
                      <div className="event-slots">
                        <span className="slots-available">{slotsAvailable} slots available</span>
                      </div>
                      <div className="slots-bar">
                        <div className="slots-fill" style={{ width: `${slotsFilled}%` }}></div>
                      </div>
                      <div className="event-footer" style={{ marginTop: '1rem' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleRegister(event.id)}
                          disabled={slotsAvailable === 0}
                          style={{ width: '100%', opacity: slotsAvailable === 0 ? 0.5 : 1 }}
                        >
                          {slotsAvailable === 0 ? 'Fully Booked' : 'Pay & Register'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: 'var(--shadow)', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>
            {profileMessage && (
              <div style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: profileMessage.includes('successfully') ? '#d1fae5' : '#fee2e2',
                color: profileMessage.includes('successfully') ? '#065f46' : '#b91c1c'
              }}>
                {profileMessage}
              </div>
            )}
            <form
              onSubmit={handleProfileUpdate}
              className="event-form"
              style={{
                boxShadow: 'none',
                padding: 0,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                columnGap: '2rem',
                rowGap: '1.5rem'
              }}
            >
              <div className="form-group" style={{ minWidth: '220px', flex: '1 1 240px' }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ minWidth: '300px', flex: '1 1 360px' }}>
                <label>Email</label>
                <div className="profile-email-row">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <button type="button" className="btn btn-secondary" onClick={openEmailModal}>Change</button>
                </div>
              </div>
              <div className="form-group" style={{ minWidth: '180px', flex: '1 1 200px' }}>
                <label>College</label>
                <input
                  type="text"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ minWidth: '170px', flex: '1 1 190px' }}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={profileForm.current_password}
                  onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                  placeholder="Required to change password"
                />
              </div>
              <div className="form-group" style={{ minWidth: '170px', flex: '1 1 190px' }}>
                <label>New Password</label>
                <input
                  type="password"
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', minWidth: '160px', flex: '1 1 100%', marginTop: '0.5rem' }}>
                <button className="btn btn-primary" type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {paymentModalOpen && paymentEvent && (
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
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '720px' }}>
              <h3>Complete Payment</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>{paymentEvent.name}</p>

              {paymentMessage && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c'
                }}>
                  {paymentMessage}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>UPI ID:</strong>
                  <div>{paymentEvent.upi_id || 'Not provided'}</div>
                </div>
                <div>
                  <strong>Bank Details:</strong>
                  <div style={{ whiteSpace: 'pre-line' }}>{paymentEvent.bank_details || 'Not provided'}</div>
                </div>
                <div>
                  <strong>Fee:</strong>
                  <div>₹{paymentEvent.fee}</div>
                </div>
                {paymentEvent.qr_code_url && (
                  <div>
                    <strong>QR Code:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={`${FILE_BASE_URL}${paymentEvent.qr_code_url}`}
                        alt="QR Code"
                        style={{ maxWidth: '180px', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Transaction Reference (optional)</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR / Ref no."
                />
              </div>
              <div className="form-group">
                <label>Upload Payment Proof *</label>
                <input type="file" accept="image/*" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={handleSubmitPayment} disabled={paymentLoading}>
                  {paymentLoading ? 'Submitting...' : 'Submit for Verification'}
                </button>
                <button className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {emailModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '480px' }}>
              <h3>Change Email</h3>
              {emailMessage && (
                <div style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: emailMessage.toLowerCase().includes('failed') ? '#fee2e2' : '#dbeafe',
                  color: emailMessage.toLowerCase().includes('failed') ? '#b91c1c' : '#1e40af'
                }}>
                  {emailMessage}
                </div>
              )}

              {emailStep === 1 && (
                <>
                  <div className="form-group">
                    <label>New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  <button className="btn btn-primary" onClick={handleRequestEmailChange} disabled={emailLoading}>
                    {emailLoading ? 'Sending OTPs...' : 'Send OTPs'}
                  </button>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>OTP (Current Email)</label>
                    <input
                      type="text"
                      value={otpOld}
                      onChange={(e) => setOtpOld(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={handleVerifyOldEmail} disabled={emailLoading}>
                      Verify Current Email
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEmailModalOpen(false)}>Cancel</button>
                  </div>
                </>
              )}

              {emailStep === 2 && (
                <>
                  <div className="form-group">
                    <label>OTP (New Email)</label>
                    <input
                      type="text"
                      value={otpNew}
                      onChange={(e) => setOtpNew(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={handleVerifyNewEmail} disabled={emailLoading}>
                      Verify New Email
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEmailModalOpen(false)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;
