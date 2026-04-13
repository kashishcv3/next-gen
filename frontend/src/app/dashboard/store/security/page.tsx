'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SecuritySettings {
  captcha_enabled: boolean;
  captcha_type: string;
  ip_restrictions_enabled: boolean;
  csrf_protection_enabled: boolean;
  password_min_length: number;
  force_https: boolean;
  session_timeout: number;
}

export default function StoreSecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    captcha_enabled: false,
    captcha_type: 'recaptcha',
    ip_restrictions_enabled: false,
    csrf_protection_enabled: true,
    password_min_length: 8,
    force_https: true,
    session_timeout: 30,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store/security');
      setSettings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/store/security', settings);
      alert('Security settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
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
          <h1>Security Settings</h1>
          <p>
            <i className="fa fa-info-circle"></i> Configure security options for your store.
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
                <h3 className="panel-title"><i className="fa fa-lock"></i> Security Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label><input type="checkbox" name="force_https" checked={settings.force_https} onChange={handleInputChange} /> Force HTTPS</label>
                  <p className="help-block">Require all connections to use HTTPS</p>
                </div>

                <hr />

                <div className="form-group">
                  <label><input type="checkbox" name="captcha_enabled" checked={settings.captcha_enabled} onChange={handleInputChange} /> Enable CAPTCHA</label>
                </div>

                {settings.captcha_enabled && (
                  <div className="form-group">
                    <label>CAPTCHA Type</label>
                    <select className="form-control" name="captcha_type" value={settings.captcha_type} onChange={handleInputChange}>
                      <option value="recaptcha">Google reCAPTCHA v3</option>
                      <option value="hcaptcha">hCaptcha</option>
                    </select>
                  </div>
                )}

                <hr />

                <div className="form-group">
                  <label><input type="checkbox" name="ip_restrictions_enabled" checked={settings.ip_restrictions_enabled} onChange={handleInputChange} /> Enable IP Restrictions</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="csrf_protection_enabled" checked={settings.csrf_protection_enabled} onChange={handleInputChange} /> Enable CSRF Protection</label>
                </div>

                <hr />

                <div className="form-group">
                  <label>Minimum Password Length</label>
                  <input
                    type="number"
                    className="form-control"
                    name="password_min_length"
                    value={settings.password_min_length}
                    onChange={handleInputChange}
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="session_timeout"
                    value={settings.session_timeout}
                    onChange={handleInputChange}
                    min={1}
                  />
                  <p className="help-block">Sessions will automatically expire after this duration of inactivity</p>
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
