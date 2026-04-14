'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TaxOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/options');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tax options');
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
      await api.post('/tax/options', options);
      setSuccess('Tax options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save options');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Options</h1>
          <p><i className="fa fa-info-circle"></i> Configure tax calculation settings.</p>
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
                  <h3 className="panel-title"><i className="fa fa-cog"></i> Tax Configuration</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Tax Calculation Method</label>
                    <select
                      className="form-control"
                      value={options['tax_method'] || ''}
                      onChange={(e) => handleChange('tax_method', e.target.value)}
                    >
                      <option value="">Select Method</option>
                      <option value="standard">Standard</option>
                      <option value="simplified">Simplified</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tax Inclusive Pricing</label>
                    <select
                      className="form-control"
                      value={options['tax_inclusive'] || 'n'}
                      onChange={(e) => handleChange('tax_inclusive', e.target.value)}
                    >
                      <option value="n">No</option>
                      <option value="y">Yes</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Default Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={options['default_tax_rate'] || ''}
                      onChange={(e) => handleChange('default_tax_rate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Apply Tax on Shipping</label>
                    <select
                      className="form-control"
                      value={options['tax_on_shipping'] || 'n'}
                      onChange={(e) => handleChange('tax_on_shipping', e.target.value)}
                    >
                      <option value="n">No</option>
                      <option value="y">Yes</option>
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
