'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DomainSettings {
  primary_domain: string;
  secondary_domains: string[];
  ssl_enabled: boolean;
  ssl_cert_path?: string;
}

export default function StoreDomainPage() {
  const [settings, setSettings] = useState<DomainSettings>({
    primary_domain: '',
    secondary_domains: [],
    ssl_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store/domain');
      setSettings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load domain settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      setSettings(prev => ({
        ...prev,
        secondary_domains: [...prev.secondary_domains, newDomain],
      }));
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (index: number) => {
    setSettings(prev => ({
      ...prev,
      secondary_domains: prev.secondary_domains.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/store/domain', settings);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update domain settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Domain Settings</h1>
          <p>
            <i className="fa fa-info-circle"></i> Configure domain and SSL settings for your store.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-globe"></i> Domain Configuration</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Primary Domain *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="primary_domain"
                    value={settings.primary_domain}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="ssl_enabled" checked={settings.ssl_enabled} onChange={handleInputChange} /> Enable SSL</label>
                </div>

                {settings.ssl_enabled && (
                  <div className="form-group">
                    <label>SSL Certificate Path</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ssl_cert_path"
                      value={settings.ssl_cert_path || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                )}

                <hr />

                <div className="form-group">
                  <label>Secondary Domains</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="example.com"
                    />
                    <span className="input-group-btn">
                      <button
                        type="button"
                        className="btn btn-default"
                        onClick={handleAddDomain}
                      >
                        Add
                      </button>
                    </span>
                  </div>

                  {settings.secondary_domains.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {settings.secondary_domains.map((domain, index) => (
                        <div key={index} className="alert alert-info" style={{ marginBottom: '5px' }}>
                          <button
                            type="button"
                            className="close"
                            onClick={() => handleRemoveDomain(index)}
                          >
                            <span>&times;</span>
                          </button>
                          {domain}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
            <a href="/store/overview" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
