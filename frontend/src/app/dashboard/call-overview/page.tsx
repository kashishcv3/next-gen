'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calls/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Call Overview</h1>
      <div className="panel panel-default">
        <div className="panel-heading"><h3 className="panel-title">Overview</h3></div>
        <div className="panel-body">
          {stats ? (
            <div>
              <p><strong>Status:</strong> {stats.status || 'N/A'}</p>
              <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
