'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ConwayIntegrationPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/conway');
      setOptions(res.data.data || res.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null);
    try {
      await api.post('/shipping/rate-tool/conway', options);
      setSuccess('Conway Integration saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Conway Integration</h1>
        <p><i className="fa fa-truck"></i> Configure Conway shipping rate integration</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-8">
          <div className="well well-cv3-table">
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input type="text" className="form-control" value={value} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            ))}
            {Object.keys(options).length === 0 && <p className="text-muted">No options loaded. The backend endpoint may need to be configured.</p>}
          </div>
        </div></div>
        <div className="row"><div className="col-lg-8">
          <button type="submit" className="btn btn-primary"><i className="fa fa-save"></i> Save Options</button>
        </div></div>
      </form>
    </div>
  );
}
