'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function BongoOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/checkout/options/bongo');
      setOptions(res.data.data || res.data || {});
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to load options'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      await api.post('/checkout/options/bongo', options);
      setSuccess('FedEx Cross Border options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const renderRadio = (name: string, label: string, value: string, description?: string) => {
    const isYes = (value || '').toLowerCase() === 'y' || value === '1' || (value || '').toLowerCase() === 'yes';
    return (
      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>{label}</label>
        {description && <p className="help-block" style={{ marginBottom: '6px' }}><small className="text-muted">{description}</small></p>}
        <label className="radio-inline" style={{ marginRight: '15px' }}>
          <input type="radio" name={name} value="y" checked={isYes}
            onChange={() => handleChange(name, 'y')} /> Yes
        </label>
        <label className="radio-inline">
          <input type="radio" name={name} value="n" checked={!isYes}
            onChange={() => handleChange(name, 'n')} /> No
        </label>
      </div>
    );
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading FedEx Cross Border options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-globe" style={{ color: '#337ab7' }}></i> FedEx Cross Border (Bongo)</h1>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            {/* Panel 1: Options */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
              </div>
              <div className="panel-body">
                {renderRadio('bongo_checkout', 'Enable Option', options['bongo_checkout'] || 'n')}

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Transfer Method</label>
                  {[
                    { value: 'viewcart_button', label: 'Viewcart Button' },
                    { value: 'country_select', label: 'Country Drop-down' },
                    { value: 'both', label: 'Both' },
                  ].map(opt => (
                    <label key={opt.value} className="radio-inline" style={{ marginRight: '15px' }}>
                      <input type="radio" name="bongo_transfer" value={opt.value}
                        checked={(options['bongo_transfer'] || '') === opt.value}
                        onChange={() => handleChange('bongo_transfer', opt.value)} /> {opt.label}
                    </label>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Shipping Method</label>
                  <input className="form-control" type="text"
                    value={options['bongo_shipper'] || ''}
                    onChange={(e) => handleChange('bongo_shipper', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Exclude Countries</label>
                  <textarea className="form-control" rows={4}
                    value={options['bongo_exclude_countries'] || ''}
                    onChange={(e) => handleChange('bongo_exclude_countries', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                  <p className="help-block"><small className="text-muted">Pipe-separated country codes, e.g. US|CA|GB</small></p>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Cancel Notification Email</label>
                  <input className="form-control" type="text"
                    value={options['bongo_cancel_notify'] || ''}
                    onChange={(e) => handleChange('bongo_cancel_notify', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <p className="help-block"><small className="text-muted">You must enable HTTP POST Notification in your FedEx Cross Border Account and enter the callback URL.</small></p>
                  <p className="help-block"><small className="text-muted">You must provide a Continue Shipping URL to FedEx Cross Border with a query string variable of &quot;cmd=clear_cart&quot;.</small></p>
                  <p className="help-block"><small className="text-muted">You must request that the PRODUCT_CUSTOM_3 field be hidden in FedEx Cross Border.</small></p>
                </div>
              </div>
            </div>

            {/* Panel 2: API Information */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> API Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Partner Key</label>
                  <input className="form-control" type="text"
                    value={options['bongo_partner_key'] || ''}
                    onChange={(e) => handleChange('bongo_partner_key', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Checkout URL</label>
                  <input className="form-control" type="text"
                    value={options['bongo_url'] || ''}
                    onChange={(e) => handleChange('bongo_url', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>
              </div>
            </div>

            {/* Panel 3: Distribution Center Location */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Distribution Center Location</h3>
              </div>
              <div className="panel-body">
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>State</label>
                  <input className="form-control" type="text"
                    value={options['bongo_dc_state'] || ''}
                    onChange={(e) => handleChange('bongo_dc_state', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Zip Code</label>
                  <input className="form-control" type="text"
                    value={options['bongo_dc_zip'] || ''}
                    onChange={(e) => handleChange('bongo_dc_zip', e.target.value)}
                    style={{ maxWidth: '300px' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Country</label>
                  <input className="form-control" type="text"
                    value={options['bongo_dc_country'] || ''}
                    onChange={(e) => handleChange('bongo_dc_country', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>
              </div>
            </div>

            {/* Panel 4: Product Export */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Product Export</h3>
              </div>
              <div className="panel-body">
                <button type="button" className="btn btn-primary btn-sm" disabled>
                  <i className="fa fa-external-link"></i> Go to Product Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <br />
        <div className="row">
          <div className="col-lg-12">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
