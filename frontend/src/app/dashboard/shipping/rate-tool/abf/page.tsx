'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ABFIntegrationPage() {
  const [form, setForm] = useState({
    abf_rate_calc: 'n',
    abf_min: '',
    abf_acct_num: '',
    abf_pass: '',
    abf_from_city: '',
    abf_from_state: '',
    abf_from_zip: '',
    abf_from_country: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/abf');
      const data = res.data.data || res.data || {};
      setForm({
        abf_rate_calc: data.abf_rate_calc || 'n',
        abf_min: data.abf_min || '',
        abf_acct_num: data.abf_acct_num || '',
        abf_pass: data.abf_pass || '',
        abf_from_city: data.abf_from_city || '',
        abf_from_state: data.abf_from_state || '',
        abf_from_zip: data.abf_from_zip || '',
        abf_from_country: data.abf_from_country || '',
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
      await api.post('/shipping/rate-tool/abf', form);
      setSuccess('ABF settings saved successfully');
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
          <h1>ABF Integration</h1>
          <p><i className="fa fa-truck"></i> Configure ABF shipping rate integration</p>
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
                        name="abf_rate_calc"
                        value="y"
                        checked={form.abf_rate_calc === 'y'}
                        onChange={() => setForm({ ...form, abf_rate_calc: 'y' })}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="abf_rate_calc"
                        value="n"
                        checked={form.abf_rate_calc === 'n'}
                        onChange={() => setForm({ ...form, abf_rate_calc: 'n' })}
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
                      value={form.abf_min}
                      onChange={(e) => setForm({ ...form, abf_min: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">ABF API Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.abf_acct_num}
                    onChange={(e) => setForm({ ...form, abf_acct_num: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.abf_pass}
                    onChange={(e) => setForm({ ...form, abf_pass: e.target.value })}
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
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.abf_from_city}
                    onChange={(e) => setForm({ ...form, abf_from_city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.abf_from_state}
                    onChange={(e) => setForm({ ...form, abf_from_state: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    size={10}
                    value={form.abf_from_zip}
                    onChange={(e) => setForm({ ...form, abf_from_zip: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.abf_from_country}
                    onChange={(e) => setForm({ ...form, abf_from_country: e.target.value })}
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
