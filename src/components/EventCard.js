import React from 'react';
import { formatDate } from '../utils/helpers';

const EventCard = ({ event, onViewDetails, onRegister }) => {
  const slotsFilled = (event.registered / event.max_participants) * 100;
  const slotsAvailable = event.max_participants - event.registered;

  return (
    <div className="event-card">
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
            className="btn btn-secondary"
            onClick={() => onViewDetails && onViewDetails(event.id)}
          >
            View Details
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onRegister && onRegister(event.id, event.name)}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
