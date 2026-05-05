'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WalletPaymentMethodsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/wallet');
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
      await api.post('/payment/options/wallet', options);
      setSuccess('Wallet & payment method settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkPaypal = async () => {
    if (!confirm('Are you sure you want to unlink your PayPal account?')) return;
    setUnlinking(true); setError(null);
    try {
      await api.post('/payment/options/wallet/unlink-paypal', {});
      setSuccess('PayPal account unlinked successfully.');
      setTimeout(() => setSuccess(null), 3000);
      await fetchOptions();
    } catch (err: any) {
      setError('Error unlinking PayPal account.');
    } finally {
      setUnlinking(false);
    }
  };

  const renderRadio = (name: string, label: string, value: string, radioOptions?: {value: string, label: string}[], helpText?: string) => {
    const opts = radioOptions || [{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }];
    return (
      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>{label}</label>
        {opts.map(opt => (
          <label key={opt.value} className="radio-inline" style={{ marginRight: '15px' }}>
            <input type="radio" name={name} value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(name, opt.value)} /> {opt.label}
          </label>
        ))}
        {helpText && <p className="help-block"><small className="text-muted">{helpText}</small></p>}
      </div>
    );
  };

  const isPaypalConnected = !!(options['paypal_psp_settings_raw'] && options['paypal_psp_settings_raw'] !== '' && options['paypal_psp_settings_raw'] !== '{}');
  const isGPayEnabled = (options['enable_google_pay'] || '').toLowerCase() === 'y';
  const isApplePayEnabled = (options['enable_apple_pay'] || '').toLowerCase() === 'y';

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading wallet settings...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-credit-card-alt" style={{ color: '#337ab7' }}></i> Wallet & Payment Methods</h1>
          <p className="text-muted">Enable and configure digital wallet payment methods for your store.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        {/* ============ PAYPAL PANEL ============ */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="accordian-paypal">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <a data-toggle="collapse" href="#collapsePayPal">
                      <i className="fa fa-toggle-down" style={{ marginRight: '6px' }}></i> PayPal
                    </a>
                  </h3>
                </div>
                <div id="collapsePayPal" className="panel-collapse collapse in">
                  <div className="panel-body">
                    {renderRadio(
                      'enable_paypal_integration',
                      'Enable PayPal Integration',
                      options['enable_paypal_integration'] || 'n'
                    )}
                    {renderRadio(
                      'paypal_prod',
                      'PayPal Environment',
                      options['paypal_prod'] || 'n',
                      [{ value: 'n', label: 'Sandbox' }, { value: 'y', label: 'Production' }],
                      'Choose Sandbox for testing or Production for live payments.'
                    )}

                    {isPaypalConnected ? (
                      <>
                        <div className="form-group">
                          <label style={{ fontWeight: 600 }}>PayPal Account Status</label>
                          <ul className="list-group" style={{ maxWidth: '600px' }}>
                            <li className="list-group-item"><b>Tracking ID:</b> {options['paypal_tracking_id'] || ''}</li>
                            <li className="list-group-item"><b>Merchant ID:</b> {options['paypal_paypal_merchant_id'] || ''}</li>
                            <li className="list-group-item"><b>Product Intent ID:</b> {options['paypal_product_intent_id'] || ''}</li>
                            <li className="list-group-item"><b>Email Confirmed:</b> {options['paypal_is_email_confirmed'] || ''}</li>
                            <li className="list-group-item"><b>Account Status:</b> {options['paypal_account_status'] || ''}</li>
                            <li className="list-group-item"><b>Permissions Granted:</b> {options['paypal_permissions_granted'] || ''}</li>
                            <li className="list-group-item"><b>Consent Status:</b> {options['paypal_consent_status'] || ''}</li>
                            <li className="list-group-item"><b>Risk Status:</b> {options['paypal_risk_status'] || ''}</li>
                          </ul>
                          <p className="help-block text-success"><i className="fa fa-check-circle"></i> PayPal account is connected.</p>
                        </div>
                        <div className="form-group">
                          <button type="button" className="btn btn-danger" onClick={handleUnlinkPaypal} disabled={unlinking}>
                            {unlinking ? <><i className="fa fa-spinner fa-spin"></i> Unlinking...</> : 'Unlink PayPal Account'}
                          </button>
                          <span className="help-block">Click to disconnect your PayPal account from this store.</span>
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        <label style={{ fontWeight: 600 }}>PayPal Partner Connection</label>
                        <p className="help-block">Click the button below to connect your PayPal account for seamless payment processing.</p>
                        <button type="button" className="btn btn-primary"
                          onClick={() => {
                            const email = prompt('Enter your PayPal email:');
                            if (!email) return;
                            alert('PayPal partner referral flow requires server-side configuration. Please contact your administrator to set up PayPal API credentials.');
                          }}>
                          Connect PayPal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <br /><br />

        {/* ============ GOOGLE PAY PANEL ============ */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="accordian-gpay">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <a data-toggle="collapse" href="#collapseGPay">
                      <i className="fa fa-toggle-down" style={{ marginRight: '6px' }}></i> Google Pay
                    </a>
                  </h3>
                </div>
                <div id="collapseGPay" className="panel-collapse collapse in">
                  <div className="panel-body">
                    {renderRadio(
                      'enable_google_pay',
                      'Enable Google Pay',
                      options['enable_google_pay'] || 'n'
                    )}
                  </div>
                  {isGPayEnabled && (
                    <div className="panel-body">
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>GPay Merchant Name</label>
                        <input className="form-control" type="text"
                          value={options['google_pay_merchant_name'] || ''}
                          onChange={(e) => handleChange('google_pay_merchant_name', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>GPay Merchant ID</label>
                        <input className="form-control" type="text"
                          value={options['google_pay_merchant_id'] || ''}
                          onChange={(e) => handleChange('google_pay_merchant_id', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>
                      {[1, 2, 3, 4].map(i => (
                        <React.Fragment key={i}>
                          <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600 }}>Label for {i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : '4th'} Credential (Payment Processor)</label>
                            <input className="form-control" type="text"
                              value={options[`label_gpay_psp_credential_${i}`] || ''}
                              onChange={(e) => handleChange(`label_gpay_psp_credential_${i}`, e.target.value)}
                              placeholder={i === 1 ? 'eg. API Key' : i === 2 ? 'eg. Merchant ID' : i === 3 ? 'eg. Public Key' : 'eg. Private Key'}
                              style={{ maxWidth: '500px' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600 }}>{i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : '4th'} Credential</label>
                            <input className="form-control" type="text"
                              value={options[`google_pay_credential_${i}`] || ''}
                              onChange={(e) => handleChange(`google_pay_credential_${i}`, e.target.value)}
                              style={{ maxWidth: '500px' }} />
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <br /><br />

        {/* ============ APPLE PAY PANEL ============ */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="accordian-applepay">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <a data-toggle="collapse" href="#collapseApplePay">
                      <i className="fa fa-toggle-down" style={{ marginRight: '6px' }}></i> Apple Pay
                    </a>
                  </h3>
                </div>
                <div id="collapseApplePay" className="panel-collapse collapse in">
                  <div className="panel-body">
                    {renderRadio(
                      'enable_apple_pay',
                      'Enable Apple Pay',
                      options['enable_apple_pay'] || 'n'
                    )}
                  </div>
                  {isApplePayEnabled && (
                    <div className="panel-body">
                      {/* File upload placeholders - display info about uploads */}
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Apple Pay Domain Verification File</label>
                        <div className="input-group" style={{ maxWidth: '500px' }}>
                          <input className="form-control" type="file" accept=".txt" disabled
                            title="File upload requires server-side handling" />
                          <span className="input-group-addon" title="Upload the Apple Pay domain verification file provided by Apple.">
                            <i className="fa fa-info-circle"></i>
                          </span>
                        </div>
                        <p className="help-block"><small className="text-muted">File uploads are handled server-side. Contact admin to update certificate files.</small></p>
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Apple Merchant Certificate (.pem)</label>
                        <div className="input-group" style={{ maxWidth: '500px' }}>
                          <input className="form-control" type="file" accept=".pem" disabled
                            title="File upload requires server-side handling" />
                          <span className="input-group-addon" title="This certificate is used to identify your domain with Apple Pay.">
                            <i className="fa fa-info-circle"></i>
                          </span>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Private Key File (.key)</label>
                        <div className="input-group" style={{ maxWidth: '500px' }}>
                          <input className="form-control" type="file" accept=".key" disabled
                            title="File upload requires server-side handling" />
                          <span className="input-group-addon" title="The private key must match the uploaded certificate.">
                            <i className="fa fa-info-circle"></i>
                          </span>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Apple Pay Merchant Identifier</label>
                        <input className="form-control" type="text"
                          value={options['apple_pay_merchant_identifier'] || ''}
                          onChange={(e) => handleChange('apple_pay_merchant_identifier', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Apple Pay Merchant Verified Domain</label>
                        <input className="form-control" type="text"
                          value={options['apple_pay_merchant_verified_domain'] || ''}
                          onChange={(e) => handleChange('apple_pay_merchant_verified_domain', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Apple Pay Merchant Display Name</label>
                        <input className="form-control" type="text"
                          value={options['apple_pay_merchant_display_name'] || ''}
                          onChange={(e) => handleChange('apple_pay_merchant_display_name', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      {[1, 2, 3, 4].map(i => (
                        <React.Fragment key={i}>
                          <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600 }}>Label for {i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : '4th'} Credential (Payment Processor)</label>
                            <input className="form-control" type="text"
                              value={options[`label_apple_psp_credential_${i}`] || ''}
                              onChange={(e) => handleChange(`label_apple_psp_credential_${i}`, e.target.value)}
                              placeholder={i === 1 ? 'eg. API Key' : i === 2 ? 'eg. Merchant ID' : i === 3 ? 'eg. Public Key' : 'eg. Private Key'}
                              style={{ maxWidth: '500px' }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600 }}>{i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : '4th'} Credential</label>
                            <input className="form-control" type="text"
                              value={options[`apple_pay_credential_${i}`] || ''}
                              onChange={(e) => handleChange(`apple_pay_credential_${i}`, e.target.value)}
                              style={{ maxWidth: '500px' }} />
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
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
