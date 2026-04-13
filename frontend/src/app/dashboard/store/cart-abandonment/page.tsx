'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CartAbandonmentSettings {
  enabled: boolean;
  email_template_id: string;
  delay_hours: number;
  include_product_images: boolean;
}

export default function StoreCartAbandonmentPage() {
  const [settings, setSettings] = useState<CartAbandonmentSettings>({
    enabled: false,
    email_template_id: '',
    delay_hours: 24,
    include_product_images: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store/cart-abandonment');
      setSettings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
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
      await api.put('/store/cart-abandonment', settings);
      alert('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Cart Abandonment Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure cart abandonment email notifications.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-envelope"></i> Cart Abandonment Configuration</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enabled" checked={settings.enabled} onChange={handleInputChange} />
                    Enable Cart Abandonment Notifications
                  </label>
                </div>

                {settings.enabled && (
                  <>
                    <div className="form-group">
                      <label>Email Template ID</label>
                      <input type="text" className="form-control" name="email_template_id" value={settings.email_template_id} onChange={handleInputChange} />
                    </div>

                    <div className="form-group">
                      <label>Send Email After (hours) *</label>
                      <input type="number" className="form-control" name="delay_hours" value={settings.delay_hours} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>
                        <input type="checkbox" name="include_product_images" checked={settings.include_product_images} onChange={handleInputChange} />
                        Include Product Images in Email
                      </label>
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
