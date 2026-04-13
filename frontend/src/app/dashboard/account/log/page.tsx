'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface LogEntry {
  username: string;
  store: string;
  action: string;
  timestamp: string;
}

interface FilterOptions {
  ranges: { [key: string]: string };
  users: { [key: string]: string };
  actions: { [key: string]: string };
}

export default function AccountLogPage() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ranges: {},
    users: {},
    actions: {},
  });

  const [filters, setFilters] = useState({
    range: '30',
    userAccount: '',
    userAction: '',
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchLog();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/account/log-options');
      setFilterOptions(response.data.data || {});
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchLog = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account/log', { params: filters });
      setLog(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch log');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchLog();
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>User Log</h1>
        </div>
      </div>
      <br />

      <p>
        <a className="btn btn-primary btn-sm" href="/account/manage">
          Manage Users
        </a>
      </p>
      <br />

      <form onSubmit={handleSubmit}>
        <div className="form-inline" style={{ marginBottom: '20px' }}>
          <div className="form-group" style={{ marginRight: '20px' }}>
            <label style={{ marginRight: '10px' }}>Time Period:</label>
            <select
              name="range"
              className="form-control"
              value={filters.range}
              onChange={handleFilterChange}
            >
              {Object.entries(filterOptions.ranges || {}).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginRight: '20px' }}>
            <label style={{ marginRight: '10px' }}>User:</label>
            <select
              name="userAccount"
              className="form-control"
              value={filters.userAccount}
              onChange={handleFilterChange}
            >
              <option value="">All Users</option>
              {Object.entries(filterOptions.users || {}).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginRight: '20px' }}>
            <label style={{ marginRight: '10px' }}>Action:</label>
            <select
              name="userAction"
              className="form-control"
              value={filters.userAction}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              {Object.entries(filterOptions.actions || {}).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {log.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Store</th>
                      <th>Action</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.username}</td>
                        <td>{entry.store}</td>
                        <td>{entry.action}</td>
                        <td>{entry.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && log.length === 0 && !error && (
        <div className="alert alert-info">
          No log entries found for the selected filters.
        </div>
      )}
    </div>
  );
}
