'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface LoginMessage {
  enabled: boolean;
  header_message: string;
  footer_message: string;
  message_color: string;
  background_color: string;
}

export default function StoreLoginMessagesPage() {
  const [settings, setSettings] = useState<LoginMessage>({
    enabled: false,
    header_message: '',
    footer_message: '',
    message_color: '#000000',
    background_color: '#FFFFFF',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store/login-messages');
      setSettings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/store/login-messages', settings);
      alert('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
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
          <h1>Login Page Messages</h1>
          <p><i className="fa fa-info-circle"></i> Configure messages displayed on the login page.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-sign-in"></i> Login Messages</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enabled" checked={settings.enabled} onChange={handleInputChange} />
                    Enable Custom Messages
                  </label>
                </div>

                {settings.enabled && (
                  <>
                    <div className="form-group">
                      <label>Header Message</label>
                      <textarea className="form-control" name="header_message" value={settings.header_message} onChange={handleInputChange} rows={3} />
                    </div>

                    <div className="form-group">
                      <label>Footer Message</label>
                      <textarea className="form-control" name="footer_message" value={settings.footer_message} onChange={handleInputChange} rows={3} />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Text Color</label>
                          <input type="color" className="form-control" name="message_color" value={settings.message_color} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Background Color</label>
                          <input type="color" className="form-control" name="background_color" value={settings.background_color} onChange={handleInputChange} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
