'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ShippingOptions {
  default_carrier: string;
  enable_free_shipping: boolean;
  free_shipping_threshold: number;
  enable_residential_surcharge: boolean;
  residential_surcharge_amount: number;
  enable_signature_required: boolean;
  enable_dimensional_weight: boolean;
}

export default function SettingsShippingPage() {
  const [options, setOptions] = useState<ShippingOptions>({
    default_carrier: 'ups',
    enable_free_shipping: false,
    free_shipping_threshold: 100,
    enable_residential_surcharge: true,
    residential_surcharge_amount: 3.99,
    enable_signature_required: false,
    enable_dimensional_weight: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/settings/shipping');
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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/settings/shipping', options);
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
          <h1>Shipping Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure shipping options.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-truck"></i> Shipping Calculation</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Default Carrier</label>
                  <select className="form-control" name="default_carrier" value={options.default_carrier} onChange={handleInputChange}>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="usps">USPS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enable_free_shipping" checked={options.enable_free_shipping} onChange={handleInputChange} />
                    Enable Free Shipping Over Amount
                  </label>
                </div>

                {options.enable_free_shipping && (
                  <div className="form-group">
                    <label>Free Shipping Threshold</label>
                    <input type="number" className="form-control" name="free_shipping_threshold" value={options.free_shipping_threshold} onChange={handleInputChange} step="0.01" />
                  </div>
                )}
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Advanced Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enable_residential_surcharge" checked={options.enable_residential_surcharge} onChange={handleInputChange} />
                    Enable Residential Surcharge
                  </label>
                </div>

                {options.enable_residential_surcharge && (
                  <div className="form-group">
                    <label>Residential Surcharge Amount</label>
                    <input type="number" className="form-control" name="residential_surcharge_amount" value={options.residential_surcharge_amount} onChange={handleInputChange} step="0.01" />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enable_signature_required" checked={options.enable_signature_required} onChange={handleInputChange} />
                    Enable Signature Required Option
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enable_dimensional_weight" checked={options.enable_dimensional_weight} onChange={handleInputChange} />
                    Enable Dimensional Weight Pricing
                  </label>
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
