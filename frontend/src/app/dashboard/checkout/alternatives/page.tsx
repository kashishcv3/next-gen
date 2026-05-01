'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const CHECKOUT_TYPES = [
  { key: 'paypal', label: 'PayPal Express / PayPal Commerce' },
  { key: 'amazon-pay', label: 'Amazon Pay' },
  { key: 'bongo', label: 'Bongo International' },
  { key: 'sezzle', label: 'Sezzle' },
  { key: 'visa', label: 'Visa Checkout' },
];

export default function CheckoutAlternativesPage() {
  const [activeTab, setActiveTab] = useState('paypal');
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions(activeTab);
  }, [activeTab]);

  const fetchOptions = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/checkout/options/${type}`);
      setOptions(response.data.data || {});
    } catch (err) {
      console.error('Failed to fetch checkout options:', err);
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
      await api.post(`/checkout/options/${activeTab}`, options);
      setMessage('Options saved successfully');
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

  const currentType = CHECKOUT_TYPES.find((t) => t.key === activeTab);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Alternative Checkouts</h1>
      <p className="text-muted">Configure alternative checkout and payment methods</p>
      <hr />

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="nav nav-tabs" style={{ marginBottom: '20px' }}>
        {CHECKOUT_TYPES.map((type) => (
          <li key={type.key} className={activeTab === type.key ? 'active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(type.key);
              }}
              style={{
                padding: '10px 15px',
                display: 'block',
                textDecoration: 'none',
                backgroundColor: activeTab === type.key ? '#fff' : 'transparent',
                borderBottom: activeTab === type.key ? '2px solid #337ab7' : 'none',
                color: activeTab === type.key ? '#337ab7' : '#555',
                fontWeight: activeTab === type.key ? 'bold' : 'normal',
              }}
            >
              {type.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">{currentType?.label || activeTab}</h3>
        </div>
        <div className="panel-body">
          {loading ? (
            <div className="alert alert-info">Loading options...</div>
          ) : Object.keys(options).length === 0 ? (
            <p className="text-muted">No options loaded. The backend endpoint may need to be configured.</p>
          ) : (
            <div>
              {Object.entries(options).map(([key, value]) => (
                <div key={key} className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor={key}>{formatLabel(key)}</label>
                  {key.includes('enabled') || key.includes('sandbox') ? (
                    <select
                      className="form-control"
                      id={key}
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="y">Yes</option>
                      <option value="n">No</option>
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  ) : (
                    <input
                      type={key.includes('password') || key.includes('secret') || key.includes('key') ? 'password' : 'text'}
                      className="form-control"
                      id={key}
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
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
    </div>
  );
}
