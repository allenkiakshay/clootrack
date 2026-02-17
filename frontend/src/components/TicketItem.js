import React, { useState } from 'react';
import axios from 'axios';

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const TicketItem = ({ ticket, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(ticket.status);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await axios.patch(`http://localhost:8000/api/tickets/${ticket.id}/`, { 
        status: newStatus 
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error("Update failed", err);
      setStatus(ticket.status); // Revert on error
    }
  };

  const priorityColor = {
    critical: 'badge-priority-critical',
    high: 'badge-priority-high',
    medium: 'badge-priority-medium',
    low: 'badge-priority-low',
  }[ticket.priority] || 'badge-priority-low';

  const statusColor = {
    open: 'badge-status-open',
    in_progress: 'badge-status-in_progress',
    resolved: 'badge-status-resolved',
    closed: 'badge-status-closed',
  }[ticket.status] || 'badge-status-open';

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <span className={`badge ${priorityColor}`}>{ticket.priority}</span>
      </div>

      <p className="ticket-description">{truncateText(ticket.description, 150)}</p>
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          <span className="category-tag">{ticket.category}</span>
          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
        </div>

        <div className="status-control">
          {isEditing ? (
            <select 
              className="form-select status-select"
              value={status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <span 
              className={`badge ${statusColor}`} 
              onClick={() => setIsEditing(true)}
              style={{ cursor: 'pointer' }}
              title="Click to change status"
            >
              {ticket.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketItem;