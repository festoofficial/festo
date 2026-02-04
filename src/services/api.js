import { API_BASE_URL } from '../config';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// OTP API
export const otpAPI = {
  sendOTP: async (email, name, college, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, name, college, role }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send OTP');
      }
      return await response.json();
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to verify OTP');
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },
};

// Events API
export const eventsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getById: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch event');
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  getByOrganizer: async (organizerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/organizer/${organizerId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch organizer events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      throw error;
    }
  },

  create: async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  uploadQr: async (eventId, file) => {
    try {
      const formData = new FormData();
      formData.append('qr', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/upload-qr`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload QR');
      }
      return await response.json();
    } catch (error) {
      console.error('Error uploading QR:', error);
      throw error;
    }
  },

  update: async (eventId, eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  delete: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};

// Registrations API
export const registrationsAPI = {
  register: async (eventId, participantId, payload = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          event_id: eventId,
          participant_id: participantId,
          payment_status: 'pending',
          paid_amount: payload.paid_amount || 0,
          payment_proof_url: payload.payment_proof_url,
          transaction_ref: payload.transaction_ref,
        }),
      });
      if (!response.ok) throw new Error('Failed to register');
      return await response.json();
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  uploadProof: async (file) => {
    try {
      const formData = new FormData();
      formData.append('proof', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/registrations/upload-proof`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload proof');
      }
      return await response.json();
    } catch (error) {
      console.error('Error uploading proof:', error);
      throw error;
    }
  },

  getForEvent: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/event/${eventId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  },

  getForParticipant: async (participantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/participant/${participantId}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch participant registrations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching participant registrations:', error);
      throw error;
    }
  },

  update: async (registrationId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update registration');
      return await response.json();
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  },

  cancel: async (registrationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to cancel registration');
      return await response.json();
    } catch (error) {
      console.error('Error canceling registration:', error);
      throw error;
    }
  },
};

// Auth API
export const authAPI = {
  updateProfile: async (userId, profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  requestEmailChange: async (userId, newEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email-change/request`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, newEmail }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request email change');
      }
      return await response.json();
    } catch (error) {
      console.error('Error requesting email change:', error);
      throw error;
    }
  },
  verifyOldEmailOtp: async (userId, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email-change/verify-old`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, otp }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to verify current email');
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying current email OTP:', error);
      throw error;
    }
  },
  verifyNewEmailOtp: async (userId, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/email-change/verify-new`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, otp }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to verify new email');
      }
      return await response.json();
    } catch (error) {
      console.error('Error verifying new email OTP:', error);
      throw error;
    }
  },
};
