'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StoreSLIPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/store/sli');
      setOptions(res.data?.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to load SLI data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/store/sli', options);
      alert('SLI configuration saved successfully');
    } catch (err: any) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-database"></i> SLI Export Configuration</h1>
          <p><i className="fa fa-info-circle"></i> Configure SLI (Search/List/Index) export settings for product data syndication.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}

      {!loading && !error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> SLI Export Settings</h3>
              </div>
              <div className="panel-body">
                {Object.keys(options).length === 0 ? (
                  <p>No SLI export configuration found for this store.</p>
                ) : (
                  <div>
                    <p style={{color: '#666', marginBottom: '20px'}}>
                      Options will be loaded from the API when the backend endpoint is connected.
                    </p>
                    {Object.entries(options).map(([key, value]) => (
                      <div key={key} style={{marginBottom: '15px'}}>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: '4px'}}>
                          {formatLabel(key)}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save Options'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
