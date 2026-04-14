'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ShippingOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/options');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipping options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    try {
      await api.post('/shipping/options', options);
      setSuccess('Shipping options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save options');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Shipping Options</h1>
          <p><i className="fa fa-info-circle"></i> Configure core shipping options.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-cog"></i> Core Shipping Settings</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Default Carrier</label>
                    <input
                      type="text"
                      className="form-control"
                      value={options['default_carrier'] || ''}
                      onChange={(e) => handleChange('default_carrier', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Shipping Threshold</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={options['free_shipping_threshold'] || ''}
                      onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Domestic Carrier</label>
                    <select
                      className="form-control"
                      value={options['domestic_carrier'] || ''}
                      onChange={(e) => handleChange('domestic_carrier', e.target.value)}
                    >
                      <option value="">Select Carrier</option>
                      <option value="usps">USPS</option>
                      <option value="fedex">FedEx</option>
                      <option value="ups">UPS</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>International Carrier</label>
                    <select
                      className="form-control"
                      value={options['international_carrier'] || ''}
                      onChange={(e) => handleChange('international_carrier', e.target.value)}
                    >
                      <option value="">Select Carrier</option>
                      <option value="usps">USPS</option>
                      <option value="fedex">FedEx</option>
                      <option value="ups">UPS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <button type="submit" className="btn btn-primary"><i className="fa fa-save"></i> Save Options</button>
            </div>
          </div>
        </form>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
