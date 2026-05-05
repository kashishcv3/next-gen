'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function FedExShippingRateToolPage() {
  const [formData, setFormData] = useState<Record<string, string>>({
    fedex_rate_calc: 'y',
    fedex_valadd: 'n',
    fedex_server: 'test',
    fedex_ship_type: 'b',
    fedex_calc_type: 'qty',
    fedex_num_per_box: '',
    fedex_min: '',
    fedex_discount_to_net: 'n',
    fedex_transit_time: 'n',
    fedex_rest_default_auth: 'soapfedex',
    fedex_account_key: '',
    fedex_account_pass: '',
    fedex_account_num: '',
    fedex_meter_num: '',
    fedex_rest_client_id: '',
    fedex_rest_client_secret: '',
    fedex_from_state: '',
    fedex_ship_from_zip: '',
    fedex_from_country: '',
    fedex_freight_account_num: '',
    fedex_freight_address: '',
    fedex_freight_address2: '',
    fedex_freight_city: '',
    fedex_freight_state: '',
    fedex_freight_zip: '',
    fedex_freight_country: '',
    fedex_freight_from: 'account',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/rate-tool/fedex');
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
      await api.post('/shipping/rate-tool/fedex', formData);
      setSuccess('FedEx Shipping Rate Tool settings saved successfully');
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

  const isSOAP = !formData.fedex_rest_default_auth || formData.fedex_rest_default_auth === 'soapfedex';

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>FedEx Shipping Rate Tool</h1>
          <p><i className="fa fa-truck"></i> Configure FedEx shipping rate calculation and authentication options</p>
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
                        name="fedex_rate_calc"
                        value="y"
                        checked={formData.fedex_rate_calc === 'y'}
                        onChange={(e) => handleChange('fedex_rate_calc', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_rate_calc"
                        value="n"
                        checked={formData.fedex_rate_calc === 'n'}
                        onChange={(e) => handleChange('fedex_rate_calc', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Use Address Validation */}
                <div className="form-group">
                  <label>Use Address Validation</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_valadd"
                        value="y"
                        checked={formData.fedex_valadd === 'y'}
                        onChange={(e) => handleChange('fedex_valadd', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_valadd"
                        value="n"
                        checked={formData.fedex_valadd === 'n'}
                        onChange={(e) => handleChange('fedex_valadd', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    <strong>Note:</strong> Address validation will call FedEx Address Validation Service to verify addresses.
                  </p>
                </div>

                {/* Certification Phase */}
                <div className="form-group">
                  <label>Certification Phase</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_server"
                        value="test"
                        checked={formData.fedex_server === 'test'}
                        onChange={(e) => handleChange('fedex_server', e.target.value)}
                      />
                      Testing
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_server"
                        value="live"
                        checked={formData.fedex_server === 'live'}
                        onChange={(e) => handleChange('fedex_server', e.target.value)}
                      />
                      Certified
                    </label>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    <strong>Note:</strong> Use Testing mode during development. Switch to Certified for production.
                  </p>
                </div>

                {/* Address Type */}
                <div className="form-group">
                  <label>Address Type</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_ship_type"
                        value="r"
                        checked={formData.fedex_ship_type === 'r'}
                        onChange={(e) => handleChange('fedex_ship_type', e.target.value)}
                      />
                      Residential
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_ship_type"
                        value="c"
                        checked={formData.fedex_ship_type === 'c'}
                        onChange={(e) => handleChange('fedex_ship_type', e.target.value)}
                      />
                      Commercial
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_ship_type"
                        value="b"
                        checked={formData.fedex_ship_type === 'b'}
                        onChange={(e) => handleChange('fedex_ship_type', e.target.value)}
                      />
                      Both
                    </label>
                  </div>
                </div>

                {/* Calculation Type */}
                <div className="form-group">
                  <label>Calculation Type</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_calc_type"
                        value="qty"
                        checked={formData.fedex_calc_type === 'qty'}
                        onChange={(e) => handleChange('fedex_calc_type', e.target.value)}
                      />
                      By Qty
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_calc_type"
                        value="weight"
                        checked={formData.fedex_calc_type === 'weight'}
                        onChange={(e) => handleChange('fedex_calc_type', e.target.value)}
                      />
                      By Weight
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_calc_type"
                        value="box"
                        checked={formData.fedex_calc_type === 'box'}
                        onChange={(e) => handleChange('fedex_calc_type', e.target.value)}
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
                    value={formData.fedex_num_per_box}
                    onChange={(e) => handleChange('fedex_num_per_box', e.target.value)}
                  />
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
                      value={formData.fedex_min}
                      onChange={(e) => handleChange('fedex_min', e.target.value)}
                    />
                  </div>
                </div>

                {/* Add Discounted Amount */}
                <div className="form-group">
                  <label>Add Discounted Amount</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_discount_to_net"
                        value="y"
                        checked={formData.fedex_discount_to_net === 'y'}
                        onChange={(e) => handleChange('fedex_discount_to_net', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_discount_to_net"
                        value="n"
                        checked={formData.fedex_discount_to_net === 'n'}
                        onChange={(e) => handleChange('fedex_discount_to_net', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                    <strong>Help:</strong> Select Yes to add your FedEx discount to calculate the net rate.
                  </p>
                </div>

                {/* Display FedEx Transit Time */}
                <div className="form-group">
                  <label>Display FedEx Transit Time</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_transit_time"
                        value="y"
                        checked={formData.fedex_transit_time === 'y'}
                        onChange={(e) => handleChange('fedex_transit_time', e.target.value)}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_transit_time"
                        value="n"
                        checked={formData.fedex_transit_time === 'n'}
                        onChange={(e) => handleChange('fedex_transit_time', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: FedEx API Information */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">FedEx API Information</h3>
              </div>
              <div className="panel-body">
                {/* Authentication Version Dropdown */}
                <div className="form-group">
                  <label>Choose Authentication Version</label>
                  <select
                    className="form-control"
                    style={{ width: '300px' }}
                    value={formData.fedex_rest_default_auth}
                    onChange={(e) => handleChange('fedex_rest_default_auth', e.target.value)}
                  >
                    <option value="soapfedex">SOAP API</option>
                    <option value="restfedex">Rest API</option>
                  </select>
                </div>

                {/* SOAP Fields */}
                {isSOAP && (
                  <>
                    <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                      <strong>Note:</strong> Visit the FedEx Developer Center to register your application and obtain your credentials.
                    </p>

                    <div className="form-group">
                      <label>Account Key</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_account_key}
                        onChange={(e) => handleChange('fedex_account_key', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_account_pass}
                        onChange={(e) => handleChange('fedex_account_pass', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_account_num}
                        onChange={(e) => handleChange('fedex_account_num', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Meter Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_meter_num}
                        onChange={(e) => handleChange('fedex_meter_num', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* REST Fields */}
                {!isSOAP && (
                  <>
                    <div className="form-group">
                      <label>Client ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_rest_client_id}
                        onChange={(e) => handleChange('fedex_rest_client_id', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Client Secret</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fedex_rest_client_secret}
                        onChange={(e) => handleChange('fedex_rest_client_secret', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Ship-from Address */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Ship-from Address</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_from_state}
                    onChange={(e) => handleChange('fedex_from_state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100px' }}
                    value={formData.fedex_ship_from_zip}
                    onChange={(e) => handleChange('fedex_ship_from_zip', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_from_country}
                    onChange={(e) => handleChange('fedex_from_country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 4: Freight Info */}
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Freight Info</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Freight Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_account_num}
                    onChange={(e) => handleChange('fedex_freight_account_num', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_address}
                    onChange={(e) => handleChange('fedex_freight_address', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_address2}
                    onChange={(e) => handleChange('fedex_freight_address2', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_city}
                    onChange={(e) => handleChange('fedex_freight_city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_state}
                    onChange={(e) => handleChange('fedex_freight_state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From Zip</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_zip}
                    onChange={(e) => handleChange('fedex_freight_zip', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Freight Ship From Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fedex_freight_country}
                    onChange={(e) => handleChange('fedex_freight_country', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Ship From</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_freight_from"
                        value="account"
                        checked={formData.fedex_freight_from === 'account'}
                        onChange={(e) => handleChange('fedex_freight_from', e.target.value)}
                      />
                      Account Address
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="fedex_freight_from"
                        value="third_party"
                        checked={formData.fedex_freight_from === 'third_party'}
                        onChange={(e) => handleChange('fedex_freight_from', e.target.value)}
                      />
                      Third Party
                    </label>
                  </div>
                </div>
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
