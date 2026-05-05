'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface FormData {
  api_calc: string;
  custom_shipping_api_version: string;
  ship_url: string;
  use_for_tax_calc: string;
  ship_post_type: string;
  custom_shipping_api_username: string;
  custom_shipping_api_password: string;
  custom_shipping_api_key: string;
}

export default function CustomShippingRatesPage() {
  const [formData, setFormData] = useState<FormData>({
    api_calc: 'n',
    custom_shipping_api_version: '1',
    ship_url: '',
    use_for_tax_calc: 'n',
    ship_post_type: 'get',
    custom_shipping_api_username: '',
    custom_shipping_api_password: '',
    custom_shipping_api_key: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/custom');
      const data = res.data.data || res.data || {};
      setFormData({
        api_calc: data.api_calc || 'n',
        custom_shipping_api_version: data.custom_shipping_api_version || '1',
        ship_url: data.ship_url || '',
        use_for_tax_calc: data.use_for_tax_calc || 'n',
        ship_post_type: data.ship_post_type || 'get',
        custom_shipping_api_username: data.custom_shipping_api_username || '',
        custom_shipping_api_password: data.custom_shipping_api_password || '',
        custom_shipping_api_key: data.custom_shipping_api_key || '',
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/shipping/rate-tool/custom', formData);
      setSuccess('Custom Shipping Rates saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Custom Shipping Rates</h1>
        </div>
      </div>

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
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Shipping Options
                </h3>
              </div>
              <div className="panel-body">

                {/* Enable API */}
                <div className="form-group">
                  <label>Enable API</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="api_calc"
                        value="y"
                        checked={formData.api_calc === 'y'}
                        onChange={(e) => handleChange('api_calc', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="api_calc"
                        value="n"
                        checked={formData.api_calc === 'n'}
                        onChange={(e) => handleChange('api_calc', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* API Version */}
                <div className="form-group">
                  <label>API Version</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="api_version"
                        value="1"
                        checked={formData.custom_shipping_api_version === '1'}
                        onChange={(e) => handleChange('custom_shipping_api_version', e.target.value)}
                      />
                      v1
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="api_version"
                        value="2"
                        checked={formData.custom_shipping_api_version === '2'}
                        onChange={(e) => handleChange('custom_shipping_api_version', e.target.value)}
                      />
                      v2
                    </label>
                  </div>
                </div>

                {/* URL */}
                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    name="ship_url"
                    value={formData.ship_url}
                    onChange={(e) => handleChange('ship_url', e.target.value)}
                    size={65}
                  />
                </div>

                {/* Use API for tax calculation */}
                <div className="form-group">
                  <label>Use API for tax calculation</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="use_for_tax_calc"
                        value="y"
                        checked={formData.use_for_tax_calc === 'y'}
                        onChange={(e) => handleChange('use_for_tax_calc', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="use_for_tax_calc"
                        value="n"
                        checked={formData.use_for_tax_calc === 'n'}
                        onChange={(e) => handleChange('use_for_tax_calc', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Method */}
                <div className="form-group">
                  <label>Method</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ship_post_type"
                        value="get"
                        checked={formData.ship_post_type === 'get'}
                        onChange={(e) => handleChange('ship_post_type', e.target.value)}
                      />
                      GET
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ship_post_type"
                        value="post"
                        checked={formData.ship_post_type === 'post'}
                        onChange={(e) => handleChange('ship_post_type', e.target.value)}
                      />
                      POST
                    </label>
                  </div>
                  <p className="help-block">
                    <span className="label label-warning">Note</span> Your API must match the method you have chosen. Please contact <a href="mailto:support@commercev3.com">support@commercev3.com</a> for more information.
                  </p>
                </div>

                {/* Username (v2 only) */}
                <div className="form-group apiv2" style={{ display: formData.custom_shipping_api_version === '2' ? 'block' : 'none' }}>
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    name="api_username"
                    value={formData.custom_shipping_api_username}
                    onChange={(e) => handleChange('custom_shipping_api_username', e.target.value)}
                    size={65}
                  />
                </div>

                {/* Password (v2 only) */}
                <div className="form-group apiv2" style={{ display: formData.custom_shipping_api_version === '2' ? 'block' : 'none' }}>
                  <label>Password</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    name="api_password"
                    value={formData.custom_shipping_api_password}
                    onChange={(e) => handleChange('custom_shipping_api_password', e.target.value)}
                    size={65}
                  />
                </div>

                {/* API Key (v2 only) */}
                <div className="form-group apiv2" style={{ display: formData.custom_shipping_api_version === '2' ? 'block' : 'none' }}>
                  <label>API Key</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    name="api_key"
                    value={formData.custom_shipping_api_key}
                    onChange={(e) => handleChange('custom_shipping_api_key', e.target.value)}
                    size={65}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
