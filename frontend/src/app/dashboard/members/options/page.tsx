'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MemberOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/options/member');
      setOptions(response.data.data || {});
      setError(null);
    } catch (err) {
      console.error('Failed to fetch member options:', err);
      setOptions({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      await api.post('/orders/options/member', options);
      setMessage('Member options saved successfully');
    } catch (err) {
      console.error('Failed to save options:', err);
      setError('Failed to save options');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Member Options</h1>
      <p className="text-muted">Configure membership and site member settings</p>
      <hr />

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="alert alert-info">Loading member options...</div>
      ) : (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Member Settings</h3>
          </div>
          <div className="panel-body">
            {Object.keys(options).length === 0 ? (
              <p className="text-muted">No options loaded. The backend endpoint may need to be configured.</p>
            ) : (
              Object.entries(options).map(([key, value]) => (
                <div key={key} className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor={key}>{formatLabel(key)}</label>
                  {value === 'y' || value === 'n' || value === 'Y' || value === 'N' ? (
                    <select
                      className="form-control"
                      id={key}
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    >
                      <option value="y">Yes</option>
                      <option value="n">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      id={key}
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          <div className="panel-footer text-right">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Options'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
