'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface FormatSettings {
  decimal_separator: string;
  thousand_separator: string;
  currency_symbol: string;
  currency_position: string;
}

export default function ProductFormatPage() {
  const [settings, setSettings] = useState<FormatSettings>({
    decimal_separator: '.',
    thousand_separator: ',',
    currency_symbol: '$',
    currency_position: 'before',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/format-settings');
      setSettings(response.data.data || settings);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/products/format-settings', settings);
      setSuccess('Format settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Format Settings</h1>
          <p><i className="fa fa-cogs"></i> Configure product display formatting.</p>
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

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Number Formatting</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Decimal Separator</label>
                  <input
                    type="text"
                    className="form-control"
                    name="decimal_separator"
                    value={settings.decimal_separator}
                    onChange={handleInputChange}
                    maxLength={1}
                  />
                </div>

                <div className="form-group">
                  <label>Thousand Separator</label>
                  <input
                    type="text"
                    className="form-control"
                    name="thousand_separator"
                    value={settings.thousand_separator}
                    onChange={handleInputChange}
                    maxLength={1}
                  />
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Currency Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Currency Symbol</label>
                  <input
                    type="text"
                    className="form-control"
                    name="currency_symbol"
                    value={settings.currency_symbol}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Currency Position</label>
                  <select
                    className="form-control"
                    name="currency_position"
                    value={settings.currency_position}
                    onChange={handleInputChange}
                  >
                    <option value="before">Before Amount ($100)</option>
                    <option value="after">After Amount (100$)</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
