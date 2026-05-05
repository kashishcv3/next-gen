'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function HelpManualsPage() {
  const [views, setViews] = useState<Record<string, string>>({});
  const [selectedView, setSelectedView] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin-tools/help-manuals');
      setViews(res.data.views || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load help manuals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!selectedView) {
      setError('Please select a view');
      return;
    }

    try {
      await api.post('/admin-tools/help-manuals', { view: selectedView });
      setSuccess('Page help updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Help Manuals</h1>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <p className="help-block">
          <i className="fa fa-info-circle"></i> Use this form to add manuals to the &quot;Help&quot; tab.
        </p>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Edit Page Help</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>View</label>
                  <select
                    className="form-control"
                    style={{ width: '400px' }}
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                  >
                    <option value="">-- Select a View --</option>
                    {Object.entries(views).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-edit"></i> Edit Page
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
