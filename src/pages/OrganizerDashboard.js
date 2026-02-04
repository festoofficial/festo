import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { authAPI, eventsAPI, registrationsAPI } from '../services/api';
import { FILE_BASE_URL } from '../config';

const OrganizerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('organizerActiveTab_' + user?.email) || 'overview';
  });
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [profileForm, setProfileForm] = useState({ name: '', college: '', current_password: '', new_password: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [otpOld, setOtpOld] = useState('');
  const [otpNew, setOtpNew] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    date: '',
    time: '',
    venue: '',
    fee: '',
    max_participants: '',
    description: '',
    upi_id: '',
    bank_details: ''
  });
  const [qrFile, setQrFile] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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

  // Fetch organizer's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user?.id) {
          const data = await eventsAPI.getByOrganizer(user.id);
          setOrganizerEvents(data.events || []);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        // no-op
      }
    };

    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  // Fetch participants when activeTab is 'participants'
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        if (activeTab === 'participants' && organizerEvents.length > 0) {
          const allParticipants = [];
          
          for (const event of organizerEvents) {
            const data = await registrationsAPI.getForEvent(event.id);
            allParticipants.push(...data.registrations || []);
          }
          
          setParticipants(allParticipants);
        }
      } catch (err) {
        console.error('Error fetching participants:', err);
      }
    };

    fetchParticipants();
  }, [activeTab, organizerEvents]);

  useEffect(() => {
    localStorage.setItem('organizerActiveTab_' + user?.email, activeTab);
  }, [activeTab, user?.email]);

  const handleAddEvent = async () => {
    try {
      if (!formData.name || !formData.category || !formData.date) {
        setActionMessage({ type: 'error', text: 'Please fill in required fields.' });
        return;
      }

      let eventId = editingEvent?.id;
      if (editingEvent) {
        await eventsAPI.update(editingEvent.id, {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          venue: formData.venue,
          fee: parseInt(formData.fee) || 0,
          max_participants: parseInt(formData.max_participants) || 0,
          upi_id: formData.upi_id,
          bank_details: formData.bank_details
        });
      } else {
        const created = await eventsAPI.create({
          organizer_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          venue: formData.venue,
          fee: parseInt(formData.fee) || 0,
          max_participants: parseInt(formData.max_participants) || 0,
          upi_id: formData.upi_id,
          bank_details: formData.bank_details
        });
        eventId = created.eventId;
      }

      if (qrFile && eventId) {
        await eventsAPI.uploadQr(eventId, qrFile);
      }

      // Refresh events list
      const data = await eventsAPI.getByOrganizer(user.id);
      setOrganizerEvents(data.events || []);
      
      setFormData({ name: '', category: '', date: '', time: '', venue: '', fee: '', max_participants: '', description: '', upi_id: '', bank_details: '' });
      setQrFile(null);      setEditingEvent(null);
      setActiveTab('overview');
      setActionMessage({ type: 'success', text: editingEvent ? 'Event updated successfully!' : 'Event created successfully!' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error: ' + err.message });
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      category: event.category,
      date: event.date,
      time: event.time,
      venue: event.venue,
      fee: event.fee,
      max_participants: event.max_participants,
      description: event.description,
      upi_id: event.upi_id || '',
      bank_details: event.bank_details || ''
    });
    setQrFile(null);    setActiveTab('addEvent');
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await eventsAPI.delete(id);
        const data = await eventsAPI.getByOrganizer(user.id);
        setOrganizerEvents(data.events || []);
        setActionMessage({ type: 'success', text: 'Event deleted successfully!' });
      } catch (err) {
        setActionMessage({ type: 'error', text: 'Error: ' + err.message });
      }
    }
  };

  const handleRemoveParticipant = async (registrationId) => {
    if (window.confirm('Remove this participant?')) {
      try {
        await registrationsAPI.cancel(registrationId);
        setParticipants(participants.filter(p => p.id !== registrationId));
        setActionMessage({ type: 'success', text: 'Participant removed successfully!' });
      } catch (err) {
        setActionMessage({ type: 'error', text: 'Error: ' + err.message });
      }
    }
  };

  const handleApproveParticipant = async (registration) => {
    if (registration.payment_status === 'paid') return;
    if (!window.confirm('Mark this payment as received?')) return;
    try {
      await registrationsAPI.update(registration.id, {
        payment_status: 'paid',
        paid_amount: registration.event_fee || 0
      });
      setParticipants(participants.map(p => (
        p.id === registration.id ? { ...p, payment_status: 'paid' } : p
      )));
      const data = await eventsAPI.getByOrganizer(user.id);
      setOrganizerEvents(data.events || []);
      setActionMessage({ type: 'success', text: 'Payment marked as paid.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error: ' + err.message });
    }
  };

  const handleSendEmail = (email) => {
    setActionMessage({ type: 'info', text: `Email sent to ${email}` });
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const totalEvents = organizerEvents.length;
  const totalParticipants = participants.length;
  const paidParticipants = participants.filter(p => p.payment_status === 'paid').length;
  const totalRevenue = organizerEvents.reduce((sum, event) => sum + (parseFloat(event.revenue) || 0), 0);
  const upcomingEvents = organizerEvents.filter(event => new Date(event.date) > new Date()).length;

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className={activeTab === 'overview' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('overview'); }}>📊 Overview</button></li>
          <li className={activeTab === 'events' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('events'); }}>📅 My Events</button></li>
          <li className={activeTab === 'addEvent' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('addEvent'); setEditingEvent(null); setFormData({ name: '', category: '', date: '', time: '', venue: '', fee: '', max_participants: '', description: '', upi_id: '', bank_details: '' }); setQrFile(null); }}>➕ Add Event</button></li>
          <li className={activeTab === 'participants' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('participants'); }}>👥 Participants</button></li>
          <li className={activeTab === 'revenue' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('revenue'); }}>💰 Revenue</button></li>
          <li className={activeTab === 'profile' ? 'active' : ''}><button type="button" className="sidebar-link" onClick={() => { setActiveTab('profile'); }}>👤 Profile</button></li>
        </ul>
      </div>

      <div className="dashboard-content">
        <h1>Welcome, {user?.name}!</h1>
        {actionMessage.text && (
          <div style={{
            marginTop: '1rem',
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: actionMessage.type === 'success' ? '#d1fae5' : actionMessage.type === 'info' ? '#dbeafe' : '#fee2e2',
            color: actionMessage.type === 'success' ? '#065f46' : actionMessage.type === 'info' ? '#1e40af' : '#b91c1c'
          }}>
            {actionMessage.text}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
              <p><strong>College:</strong> {user?.college}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><h3>Total Events</h3><div className="stat-value">{totalEvents}</div></div>
              <div className="stat-card"><h3>Total Registrations</h3><div className="stat-value">{totalParticipants}</div></div>
              <div className="stat-card"><h3>Total Revenue</h3><div className="stat-value">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div></div>
              <div className="stat-card"><h3>Upcoming Events</h3><div className="stat-value">{upcomingEvents}</div></div>
            </div>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem' }}>
              <h2>Recent Events</h2>
              {organizerEvents.length > 0 ? organizerEvents.map(event => (
                <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>📅 {formatDate(event.date)} | 👥 {event.registered}/{event.max_participants} | 💰 ₹{event.revenue}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleEditEvent(event)}>Edit</button>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No events</p>}
            </div>
          </>
        )}

        {activeTab === 'addEvent' && (
          <div className="event-form">
            <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <div className="form-group">
                <label>Event Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Technology">Technology</option>
                  <option value="Culture">Culture</option>
                  <option value="Sports">Sports</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fee (₹)</label>
                <input type="number" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Max Participants</label>
                <input type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Payment</label>
                <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setPaymentModalOpen(true)}>
                  {(formData.upi_id || formData.bank_details || qrFile) ? 'Payment Added' : 'Add Payment Details'}
                </button>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '100px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', gridColumn: '1 / -1' }}>
                <button className="btn btn-primary" onClick={handleAddEvent} style={{ flex: 1 }}>{editingEvent ? 'Update' : 'Create'}</button>
                <button className="btn btn-secondary" onClick={() => { setEditingEvent(null); setActiveTab('overview'); }} style={{ flex: 1 }}>Cancel</button>
              </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem' }}>
            <h2>My Events</h2>
            {organizerEvents.length > 0 ? (
              <table style={{ marginTop: '1rem' }}>
                <thead><tr><th>Name</th><th>Date</th><th>Participants</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {organizerEvents.map(event => (
                    <tr key={event.id}>
                      <td><strong>{event.name}</strong></td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.registered}/{event.max_participants}</td>
                      <td>₹{event.revenue}</td>
                      <td><span style={{ color: new Date(event.date) > new Date() ? '#10b981' : '#64748b' }}>{new Date(event.date) > new Date() ? 'Upcoming' : 'Completed'}</span></td>
                      <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleEditEvent(event)}>Edit</button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#ef4444', color: 'white' }} onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No events. Click Add Event.</p>}
          </div>
        )}

        {activeTab === 'participants' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem' }}>
            <h2>Participants</h2>
            {participants.length > 0 ? (
              <div className="table-scroll">
              <table style={{ marginTop: '1rem' }}>
                <thead><tr><th>Name</th><th>Email</th><th>Event</th><th>Date</th><th>Status</th><th>Proof</th><th>Actions</th></tr></thead>
                <tbody>
                  {participants.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.email}</td>
                      <td>{p.event_name}</td>
                      <td>{formatDate(p.registration_date)}</td>
                      <td><span style={{ color: p.payment_status === 'paid' ? '#10b981' : '#f59e0b' }}>{p.payment_status}</span></td>
                      <td>
                        {p.payment_proof_url ? (
                          <a href={`${FILE_BASE_URL}${p.payment_proof_url}`} target="_blank" rel="noreferrer">View</a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="actions-cell">
                        <div className="actions-group">
                        {p.payment_status !== 'paid' && (
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleApproveParticipant(p)}>Approve</button>
                        )}
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleSendEmail(p.email)}>Email</button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#ef4444', color: 'white' }} onClick={() => handleRemoveParticipant(p.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No participants</p>}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem' }}>
            <h2>Revenue</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>Total</h3><div className="stat-value">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div></div>
              <div className="stat-card"><h3>Registrations</h3><div className="stat-value">{totalParticipants}</div></div>
              <div className="stat-card"><h3>Paid Participants</h3><div className="stat-value">{paidParticipants}</div></div>
            </div>
            <h3 style={{ marginTop: '2rem' }}>By Event</h3>
            {organizerEvents.map(event => (
              <div key={event.id} className="revenue-item">
                <span>{event.name} ({parseInt(event.registered, 10) || 0} @ ₹{event.fee})</span>
                <span>₹{(parseFloat(event.revenue) || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        )}

        {paymentModalOpen && (
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
              <h3>Payment Details</h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                Add any payment method you want. These details will be shown to participants.
              </p>
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="example@upi"
                />
              </div>
              <div className="form-group">
                <label>Bank Details</label>
                <textarea
                  value={formData.bank_details}
                  onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })}
                  placeholder="Account name, number, IFSC, bank, etc."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '100px' }}
                />
              </div>
              <div className="form-group">
                <label>QR Code</label>
                <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files?.[0] || null)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => setPaymentModalOpen(false)}>Save</button>
                <button className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%' }}>
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
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'nowrap', alignItems: 'center', width: '100%' }}>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ flex: '1 1 auto', minWidth: '260px' }}
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

export default OrganizerDashboard;
