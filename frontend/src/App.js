import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Stats from './components/Stats';
import TicketForm from './components/TicketForm';
import TicketItem from './components/TicketItem';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Separate search term for debouncing
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const refreshData = useCallback(async () => {
    try {
      const params = { ...filters, search: debouncedSearch };
      const ticketRes = await axios.get('http://localhost:8000/api/tickets/', { params });
      const statsRes = await axios.get('http://localhost:8000/api/tickets/stats/');
      setTickets(ticketRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { refreshData(); }, [refreshData]);

  return (
    <div className="container">
      <header>
        <h1>Ticket Management Dashboard</h1>
      </header>
      
      <Stats stats={stats} />
      
      <div className="main-layout">
        <aside>
          <TicketForm onTicketCreated={refreshData} />
        </aside>
        
        <main className="ticket-list-container">
          <div className="filter-bar">
            <input 
              className="form-input search-input" 
              placeholder="Search tickets..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} 
            />
            
            <select 
              className="form-select filter-select" 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select 
              className="form-select filter-select" 
              value={filters.priority} 
              onChange={e => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select 
              className="form-select filter-select" 
              value={filters.category} 
              onChange={e => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
            </select>
          </div>
          
          <div className="ticket-list">
            {tickets.length > 0 ? (
              tickets.map(t => (
                <TicketItem 
                  key={t.id} 
                  ticket={t} 
                  onUpdate={refreshData} 
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No tickets found matching your filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;