import React from 'react';

const Stats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="stats-grid">
        <div className="stat-card"><h3>-</h3><p>Total</p></div>
        <div className="stat-card"><h3>-</h3><p>Open</p></div>
        <div className="stat-card"><h3>-</h3><p>Avg/Day</p></div>
        <div className="stat-card"><h3>-</h3><p>Critical</p></div>
      </div>
    );
  }

  const renderBreakdown = (breakdown, title) => (
    <div className="stat-card breakdown-card">
      <h4>{title}</h4>
      <ul>
        {Object.entries(breakdown).map(([key, value]) => (
          <li key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: <span>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>{stats.total_tickets}</h3>
        <p>Total Tickets</p>
      </div>
      <div className="stat-card">
        <h3>{stats.open_tickets}</h3>
        <p>Open Tickets</p>
      </div>
      <div className="stat-card">
        <h3>{stats.average_tickets_per_day ? stats.average_tickets_per_day.toFixed(1) : 0}</h3>
        <p>Avg. Per Day</p>
      </div>
      <div className="stat-card critical-stat-card">
        <h3>{stats.priority_breakdown?.critical || 0}</h3>
        <p>Critical Issues</p>
      </div>
      
      {renderBreakdown(stats.priority_breakdown, "Priority Breakdown")}
      {renderBreakdown(stats.category_breakdown, "Category Breakdown")}
    </div>
  );
};

export default Stats;