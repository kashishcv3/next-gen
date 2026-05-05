'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function UPSShippingRateToolPage() {
  const [formData, setFormData] = useState<Record<string, string>>({
    rate_calc: 'y',
    excl_address: 'n',
    ship_from_zip: '',
    calc_type: 'qty',
    num_per_box: '',
    ship_type: 'b',
    min_ups: '',
    ups_rate_type: 'published',
    ups_time_in_transit: 'n',
    ups_transit_fixed: 'n',
    ups_freight_default_auth: 'auth1',
    ups_freight_user: '',
    ups_freight_password: '',
    ups_freight_access_key: '',
    ups_freight_ship_num: '',
    ups_freight_client_id: '',
    ups_freight_client_secret: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/ups');
      const data = res.data.data || res.data || {};
      setFormData((prev) => ({ ...prev, ...data }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/shipping/rate-tool/ups', formData);
      setSuccess('UPS Shipping Rate Tool settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  const isAuth1 = !formData.ups_freight_default_auth || formData.ups_freight_default_auth === 'auth1';

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>UPS Shipping Rate Tool</h1>
          <p><i className="fa fa-truck"></i> Configure UPS shipping rate calculation and time-in-transit options</p>
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
        {/* PANEL 1: Shipping Options */}
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Shipping Options</h3>
              </div>
              <div className="panel-body">
                {/* Calculate Shipping */}
                <div className="form-group">
                  <label>Calculate Shipping</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="rate_calc"
                        value="y"
                        checked={formData.rate_calc === 'y'}
                        onChange={(e) => handleChange('rate_calc', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="rate_calc"
                        value="n"
                        checked={formData.rate_calc === 'n'}
                        onChange={(e) => handleChange('rate_calc', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Exclude address in shipping calculations */}
                <div className="form-group">
                  <label>Exclude address in shipping calculations</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="excl_address"
                        value="y"
                        checked={formData.excl_address === 'y'}
                        onChange={(e) => handleChange('excl_address', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="excl_address"
                        value="n"
                        checked={formData.excl_address === 'n'}
                        onChange={(e) => handleChange('excl_address', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Ship-from Zip Code */}
                <div className="form-group">
                  <label>Ship-from Zip Code</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100px' }}
                    value={formData.ship_from_zip}
                    onChange={(e) => handleChange('ship_from_zip', e.target.value)}
                  />
                </div>

                {/* Calculation Type */}
                <div className="form-group">
                  <label>Calculation Type</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="calc_type"
                        value="qty"
                        checked={formData.calc_type === 'qty'}
                        onChange={(e) => handleChange('calc_type', e.target.value)}
                      />
                      By Qty
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="calc_type"
                        value="weight"
                        checked={formData.calc_type === 'weight'}
                        onChange={(e) => handleChange('calc_type', e.target.value)}
                      />
                      By Weight
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="calc_type"
                        value="box"
                        checked={formData.calc_type === 'box'}
                        onChange={(e) => handleChange('calc_type', e.target.value)}
                      />
                      Per Box
                    </label>
                  </div>
                </div>

                {/* Quantity per Box */}
                <div className="form-group">
                  <label>Quantity per Box</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100px' }}
                    value={formData.num_per_box}
                    onChange={(e) => handleChange('num_per_box', e.target.value)}
                  />
                </div>

                {/* Address Type */}
                <div className="form-group">
                  <label>Address Type</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ship_type"
                        value="r"
                        checked={formData.ship_type === 'r'}
                        onChange={(e) => handleChange('ship_type', e.target.value)}
                      />
                      Residential
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ship_type"
                        value="c"
                        checked={formData.ship_type === 'c'}
                        onChange={(e) => handleChange('ship_type', e.target.value)}
                      />
                      Commercial
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ship_type"
                        value="b"
                        checked={formData.ship_type === 'b'}
                        onChange={(e) => handleChange('ship_type', e.target.value)}
                      />
                      Both
                    </label>
                  </div>
                </div>

                {/* Minimum Amount */}
                <div className="form-group">
                  <label>Minimum Amount</label>
                  <div className="input-group" style={{ width: '150px' }}>
                    <span className="input-group-addon">$</span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px' }}
                      value={formData.min_ups}
                      onChange={(e) => handleChange('min_ups', e.target.value)}
                    />
                  </div>
                </div>

                {/* What type of rates */}
                <div className="form-group">
                  <label>What type of rates do you want to use?</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_rate_type"
                        value="negotiated"
                        checked={formData.ups_rate_type === 'negotiated'}
                        onChange={(e) => handleChange('ups_rate_type', e.target.value)}
                      />
                      Negotiated Rates
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_rate_type"
                        value="published"
                        checked={formData.ups_rate_type === 'published'}
                        onChange={(e) => handleChange('ups_rate_type', e.target.value)}
                      />
                      Published Rates
                    </label>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    <strong>Note:</strong> Negotiated Rates require a valid UPS Account with negotiated pricing. Published Rates are standard UPS rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: Time in Transit Options */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Time in Transit Options</h3>
              </div>
              <div className="panel-body">
                {/* Calculate Time in Transit */}
                <div className="form-group">
                  <label>Calculate Time in Transit</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_time_in_transit"
                        value="y"
                        checked={formData.ups_time_in_transit === 'y'}
                        onChange={(e) => handleChange('ups_time_in_transit', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_time_in_transit"
                        value="n"
                        checked={formData.ups_time_in_transit === 'n'}
                        onChange={(e) => handleChange('ups_time_in_transit', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Include Fixed Shipping Items */}
                <div className="form-group">
                  <label>Include Fixed Shipping Items</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_transit_fixed"
                        value="y"
                        checked={formData.ups_transit_fixed === 'y'}
                        onChange={(e) => handleChange('ups_transit_fixed', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="ups_transit_fixed"
                        value="n"
                        checked={formData.ups_transit_fixed === 'n'}
                        onChange={(e) => handleChange('ups_transit_fixed', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: UPS API Information */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">UPS API Information</h3>
              </div>
              <div className="panel-body">
                {/* Authentication Version Dropdown */}
                <div className="form-group">
                  <label>Choose Authentication Version</label>
                  <select
                    className="form-control"
                    style={{ width: '300px' }}
                    value={formData.ups_freight_default_auth}
                    onChange={(e) => handleChange('ups_freight_default_auth', e.target.value)}
                  >
                    <option value="auth1">Authentication Version 1</option>
                    <option value="auth2">Authentication Version 2</option>
                  </select>
                </div>

                {/* Shipper Number */}
                <div className="form-group">
                  <label>Shipper Number</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '300px' }}
                    value={formData.ups_freight_ship_num}
                    onChange={(e) => handleChange('ups_freight_ship_num', e.target.value)}
                  />
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    <strong>Note:</strong> Your UPS Shipper Number is required for negotiated rates. Leave blank for published rates.
                  </p>
                </div>

                {/* Auth Version 1 Fields */}
                {isAuth1 && (
                  <>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ups_freight_user}
                        onChange={(e) => handleChange('ups_freight_user', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.ups_freight_password}
                        onChange={(e) => handleChange('ups_freight_password', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Access Key</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ups_freight_access_key}
                        onChange={(e) => handleChange('ups_freight_access_key', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Auth Version 2 Fields */}
                {!isAuth1 && (
                  <>
                    <div className="form-group">
                      <label>Client ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.ups_freight_client_id}
                        onChange={(e) => handleChange('ups_freight_client_id', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Client Secret</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.ups_freight_client_secret}
                        onChange={(e) => handleChange('ups_freight_client_secret', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-check"></i> Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
