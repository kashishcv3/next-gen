'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ConwayIntegrationPage() {
  const [form, setForm] = useState({
    cw_rate_calc: 'n',
    cw_min: '',
    cw_customer_num: '',
    cw_user: '',
    cw_pass: '',
    cw_from_zip: '',
    cw_from_country: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/conway');
      const data = res.data.data || res.data || {};
      setForm({
        cw_rate_calc: data.cw_rate_calc || 'n',
        cw_min: data.cw_min || '',
        cw_customer_num: data.cw_customer_num || '',
        cw_user: data.cw_user || '',
        cw_pass: data.cw_pass || '',
        cw_from_zip: data.cw_from_zip || '',
        cw_from_country: data.cw_from_country || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/shipping/rate-tool/conway', form);
      setSuccess('Conway settings saved successfully');
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
          <h1>Conway Integration</h1>
          <p><i className="fa fa-truck"></i> Configure Conway shipping rate integration</p>
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
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Shipping Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Calculate Shipping</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="cw_rate_calc"
                        value="y"
                        checked={form.cw_rate_calc === 'y'}
                        onChange={() => setForm({ ...form, cw_rate_calc: 'y' })}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="cw_rate_calc"
                        value="n"
                        checked={form.cw_rate_calc === 'n'}
                        onChange={() => setForm({ ...form, cw_rate_calc: 'n' })}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Minimum Amount</label>
                  <div>
                    $ <input
                      type="text"
                      className="form-control form-control-inline"
                      value={form.cw_min}
                      onChange={(e) => setForm({ ...form, cw_min: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Con-way API Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Customer Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.cw_customer_num}
                    onChange={(e) => setForm({ ...form, cw_customer_num: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.cw_user}
                    onChange={(e) => setForm({ ...form, cw_user: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.cw_pass}
                    onChange={(e) => setForm({ ...form, cw_pass: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Ship-from Address</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    size={10}
                    value={form.cw_from_zip}
                    onChange={(e) => setForm({ ...form, cw_from_zip: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.cw_from_country}
                    onChange={(e) => setForm({ ...form, cw_from_country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-save"></i> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
