'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function USPSIntegrationPage() {
  const [form, setForm] = useState({
    usps_rate_calc: 'n',
    usps_user_id: '',
    usps_live: 'n',
    usps_ship_from_zip: '',
    usps_calc_type: 'qty',
    usps_num_per_box: '',
    usps_min: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/usps');
      const data = res.data.data || res.data || {};
      setForm({
        usps_rate_calc: data.usps_rate_calc || 'n',
        usps_user_id: data.usps_user_id || '',
        usps_live: data.usps_live || 'n',
        usps_ship_from_zip: data.usps_ship_from_zip || '',
        usps_calc_type: data.usps_calc_type || 'qty',
        usps_num_per_box: data.usps_num_per_box || '',
        usps_min: data.usps_min || '',
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
      await api.post('/shipping/rate-tool/usps', form);
      setSuccess('USPS settings saved successfully');
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
          <h1>USPS Integration</h1>
          <p><i className="fa fa-truck"></i> Configure USPS shipping rate integration</p>
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
                        name="usps_rate_calc"
                        value="y"
                        checked={form.usps_rate_calc === 'y'}
                        onChange={() => setForm({ ...form, usps_rate_calc: 'y' })}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_rate_calc"
                        value="n"
                        checked={form.usps_rate_calc === 'n'}
                        onChange={() => setForm({ ...form, usps_rate_calc: 'n' })}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.usps_user_id}
                    onChange={(e) => setForm({ ...form, usps_user_id: e.target.value })}
                  />
                  {!form.usps_user_id && (
                    <p className="help-block">
                      <a href="https://www.usps.com/business/web-tools-apis/" target="_blank" rel="noopener noreferrer">
                        Get USPS User ID
                      </a>
                    </p>
                  )}
                  <p className="help-block">
                    <span className="label label-warning">Note</span> Each store requires a separate USPS User ID
                  </p>
                </div>

                <div className="form-group">
                  <label>Environment</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_live"
                        value="n"
                        checked={form.usps_live === 'n'}
                        onChange={() => setForm({ ...form, usps_live: 'n' })}
                      />
                      Testing
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_live"
                        value="y"
                        checked={form.usps_live === 'y'}
                        onChange={() => setForm({ ...form, usps_live: 'y' })}
                      />
                      Production
                    </label>
                  </div>
                  <p className="help-block">
                    <span className="label label-warning">Note</span> Ensure your USPS account is activated for production use
                  </p>
                </div>

                <div className="form-group">
                  <label>Ship-from Zip Code</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    size={10}
                    value={form.usps_ship_from_zip}
                    onChange={(e) => setForm({ ...form, usps_ship_from_zip: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Calculation Type</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_calc_type"
                        value="qty"
                        checked={form.usps_calc_type === 'qty'}
                        onChange={() => setForm({ ...form, usps_calc_type: 'qty' })}
                      />
                      By Qty
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_calc_type"
                        value="weight"
                        checked={form.usps_calc_type === 'weight'}
                        onChange={() => setForm({ ...form, usps_calc_type: 'weight' })}
                      />
                      By Weight
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="usps_calc_type"
                        value="box"
                        checked={form.usps_calc_type === 'box'}
                        onChange={() => setForm({ ...form, usps_calc_type: 'box' })}
                      />
                      Per Box
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Quantity per Box</label>
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    size={10}
                    value={form.usps_num_per_box}
                    onChange={(e) => setForm({ ...form, usps_num_per_box: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Amount</label>
                  <div>
                    $ <input
                      type="text"
                      className="form-control form-control-inline"
                      size={10}
                      value={form.usps_min}
                      onChange={(e) => setForm({ ...form, usps_min: e.target.value })}
                    />
                  </div>
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
