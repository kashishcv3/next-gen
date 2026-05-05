'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PayPalOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/checkout/options/paypal');
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
      await api.post('/checkout/options/paypal', options);
      setSuccess('PayPal options saved successfully');
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

  const renderCustomRadio = (name: string, label: string, radioOptions: { value: string; label: string }[], description?: string) => {
    const current = options[name] || '';
    return (
      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>{label}</label>
        {description && <p className="help-block" style={{ marginBottom: '6px' }}><small className="text-muted">{description}</small></p>}
        {radioOptions.map(opt => (
          <label key={opt.value} className="radio-inline" style={{ marginRight: '15px' }}>
            <input type="radio" name={name} value={opt.value}
              checked={current === opt.value}
              onChange={() => handleChange(name, opt.value)} /> {opt.label}
          </label>
        ))}
      </div>
    );
  };

  const isRestMode = (options['paypal_exp_rest'] || '').toLowerCase() === 'y';
  const isOnboarded = (options['paypal_onboarded'] || '') === 'y';
  const hasCredentials = !!(options['paypal_exp_rest_clientid'] && options['paypal_exp_rest_secret']);

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading PayPal options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-paypal" style={{ color: '#337ab7' }}></i> PayPal Options</h1>
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
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Business Account Email</label>
                  <input className="form-control" type="text"
                    value={options['paypal_business'] || ''}
                    onChange={(e) => handleChange('paypal_business', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Collect Billing Information</label>
                  <label className="radio-inline" style={{ marginRight: '15px' }}>
                    <input type="radio" name="paypal_skip" value="n"
                      checked={(options['paypal_skip'] || '') !== 'y'}
                      onChange={() => handleChange('paypal_skip', 'n')} /> Yes
                  </label>
                  <label className="radio-inline">
                    <input type="radio" name="paypal_skip" value="y"
                      checked={(options['paypal_skip'] || '') === 'y'}
                      onChange={() => handleChange('paypal_skip', 'y')} /> No
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <p className="help-block"><small className="text-muted">You must enable Instant Payment Notification and set the IPN URL in your PayPal business account.</small></p>
                </div>

                {renderRadio('paypal_use_shipping', 'Send Shipping as Billing Address', options['paypal_use_shipping'] || 'n')}
              </div>
            </div>

            {/* Panel 2: Express Checkout Options */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Express Checkout Options</h3>
              </div>
              <div className="panel-body">
                {renderCustomRadio('paypal_exp_rest', 'PayPal Version', [
                  { value: 'n', label: 'Express' },
                  { value: 'y', label: 'PayPal Checkout' },
                ], 'PayPal Express is deprecated.')}

                {renderRadio('paypal_exp_billing', 'Request Billing Information', options['paypal_exp_billing'] || 'n',
                  'You will need to contact PayPal support to enable this setting in your PayPal account.')}

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>PayPal Unreachable Behavior</label>
                  <select className="form-control"
                    value={options['paypal_unreachable'] || 'n'}
                    onChange={(e) => handleChange('paypal_unreachable', e.target.value)}
                    style={{ maxWidth: '500px' }}>
                    <option value="y">Pass orders through uncharged</option>
                    <option value="n">Prevent orders from being placed</option>
                  </select>
                </div>

                {!isRestMode && (
                  <>
                    {renderRadio('paypal_exp_shipping', 'Override Shipping Information in PayPal', options['paypal_exp_shipping'] || 'n')}

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>PayPal Image</label>
                      <input className="form-control" type="text"
                        value={options['paypal_exp_image'] || ''}
                        onChange={(e) => handleChange('paypal_exp_image', e.target.value)}
                        style={{ maxWidth: '500px' }} />
                      <p className="help-block"><small className="text-muted">Image path must be secure (https) for it to display in PayPal.</small></p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Panel 3: PayPal API Information */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> PayPal API Information</h3>
              </div>

              {/* REST API section */}
              {isRestMode && (
                <div className="panel-body">
                  {renderCustomRadio('paypal_exp_rest_version', 'PayPal Checkout Version', [
                    { value: '1', label: 'v1' },
                    { value: '2', label: 'v2' },
                  ], 'Versions before v2 are deprecated.')}

                  {isOnboarded ? (
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>Merchant ID</label>
                      <p>{options['paypal_merchant_id_rest'] || 'N/A'}</p>
                      <button type="button" className="btn btn-primary btn-sm"
                        onClick={() => {
                          handleChange('paypal_onboarded', 'n');
                          handleChange('paypal_merchant_id_rest', '');
                        }}>Unlink Account</button>
                    </div>
                  ) : (
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <button type="button" className="btn btn-primary btn-sm" disabled>
                        Link Account
                      </button>
                      <p className="help-block"><small className="text-muted">PayPal account linking requires server-side OAuth configuration.</small></p>
                    </div>
                  )}

                  {renderRadio('paypal_exp_authonly', 'Authorize Only Mode', options['paypal_exp_authonly'] || 'n')}

                  {!isOnboarded && hasCredentials && (
                    renderCustomRadio('paypal_exp_rest_environment', 'Environment', [
                      { value: 'live', label: 'Live' },
                      { value: 'test', label: 'Test' },
                    ])
                  )}

                  {!isOnboarded && (
                    <>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <p className="help-block"><small className="text-muted">You can find the following information at Dashboard → My Apps and Credentials → REST API Apps → Create App</small></p>
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Client ID</label>
                        <input className="form-control" type="text"
                          value={options['paypal_exp_rest_clientid'] || ''}
                          onChange={(e) => handleChange('paypal_exp_rest_clientid', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Secret</label>
                        <input className="form-control" type="text"
                          value={options['paypal_exp_rest_secret'] || ''}
                          onChange={(e) => handleChange('paypal_exp_rest_secret', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SOAP API section */}
              {!isRestMode && (
                <div className="panel-body">
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <p className="help-block"><small className="text-muted">You can find the following information at Profile → API Access → Request API Credentials → API Signature in your PayPal business account.</small></p>
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 600 }}>Username</label>
                    <input className="form-control" type="text"
                      value={options['paypal_exp_username'] || ''}
                      onChange={(e) => handleChange('paypal_exp_username', e.target.value)}
                      style={{ maxWidth: '500px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 600 }}>Password</label>
                    <input className="form-control" type="text"
                      value={options['paypal_exp_password'] || ''}
                      onChange={(e) => handleChange('paypal_exp_password', e.target.value)}
                      style={{ maxWidth: '500px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ fontWeight: 600 }}>Signature Hash</label>
                    <input className="form-control" type="text"
                      value={options['paypal_exp_signature'] || ''}
                      onChange={(e) => handleChange('paypal_exp_signature', e.target.value)}
                      style={{ maxWidth: '500px' }} />
                  </div>
                </div>
              )}
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
