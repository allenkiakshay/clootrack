import React, { useState } from 'react';
import axios from 'axios';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'low'
  });
  const [loading, setLoading] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');

  const handleDescriptionBlur = async () => {
    if (formData.description.length < 10) return;
    
    setLoading(true);
    setSuggestionMessage('AI is analyzing your request...');
    
    try {
      const res = await axios.post('http://localhost:8000/api/tickets/classify/', { 
        description: formData.description 
      });
      
      setFormData(prev => ({
        ...prev,
        category: res.data.suggested_category || 'general',
        priority: res.data.suggested_priority || 'low'
      }));
      setSuggestionMessage('Category and Priority auto-suggested!');
      setTimeout(() => setSuggestionMessage(''), 3000);
      
    } catch (err) {
      console.error("AI Classification failed", err);
      setSuggestionMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/tickets/', formData);
      setFormData({ title: '', description: '', category: 'general', priority: 'low' });
      onTicketCreated();
    } catch (error) {
      console.error("Error creating ticket", error);
      alert("Failed to create ticket. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <span className="form-title">Create New Ticket</span>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input 
            className="form-input"
            placeholder="Brief summary of the issue"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required
            maxLength="200" 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-textarea"
            placeholder="Detailed explanation..."
            value={formData.description}
            onBlur={handleDescriptionBlur}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>
        
        {loading && <div className="ai-badge">✨ {suggestionMessage}</div>}
        {!loading && suggestionMessage && <div style={{color: 'green', marginBottom: '10px', fontSize: '0.9em'}}>{suggestionMessage}</div>}

        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            className="form-select" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select 
            className="form-select" 
            value={formData.priority} 
            onChange={e => setFormData({...formData, priority: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Submit Ticket</button>
      </form>
    </div>
  );
};

export default TicketForm;