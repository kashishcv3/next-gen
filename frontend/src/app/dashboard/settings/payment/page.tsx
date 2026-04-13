'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

interface PaymentOptions {
  payment_methods: PaymentMethod[];
  require_cvv: boolean;
  store_credit_cards: boolean;
  enable_subscriptions: boolean;
  default_currency: string;
}

export default function SettingsPaymentPage() {
  const [options, setOptions] = useState<PaymentOptions>({
    payment_methods: [],
    require_cvv: true,
    store_credit_cards: false,
    enable_subscriptions: false,
    default_currency: 'USD',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/settings/payment');
      setOptions(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMethodToggle = (methodId: string, enabled: boolean) => {
    setOptions(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.map(m => 
        m.id === methodId ? { ...m, enabled } : m
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/settings/payment', options);
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
          <h1>Payment Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure payment methods and options.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-credit-card"></i> Payment Methods</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr><th>Payment Method</th><th>Type</th><th>Enabled</th></tr>
                  </thead>
                  <tbody>
                    {options.payment_methods.map(method => (
                      <tr key={method.id}>
                        <td>{method.name}</td>
                        <td>{method.type}</td>
                        <td>
                          <input type="checkbox" checked={method.enabled} onChange={(e) => handleMethodToggle(method.id, e.target.checked)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Payment Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Default Currency</label>
                  <select className="form-control" name="default_currency" value={options.default_currency} onChange={handleInputChange}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="require_cvv" checked={options.require_cvv} onChange={handleInputChange} /> Require CVV</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="store_credit_cards" checked={options.store_credit_cards} onChange={handleInputChange} /> Store Credit Cards</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="enable_subscriptions" checked={options.enable_subscriptions} onChange={handleInputChange} /> Enable Subscriptions</label>
                </div>
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
