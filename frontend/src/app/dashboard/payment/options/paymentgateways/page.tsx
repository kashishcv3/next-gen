'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PaymentGatewaysPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/gateways');
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
      await api.post('/payment/options/gateways', options);
      setSuccess('Payment gateway options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    payment_gateway: 'Payment Gateway',
    tokenize_cc_numbers: 'Tokenize Credit Card Numbers',
    authorize_cim: 'Authorize.net CIM',
    authorize_cim_env: 'CIM Environment',
    payment_app_store_use: 'Use Payment App Store',
    payment_app_store_config_id: 'App Store Config ID',
    payment_app_store_config: 'App Store Configuration',
    payment_app_store_save_disabled: 'Disable App Store Save',
    gateway_type: 'Gateway Type',
    gateway_username: 'Gateway Username / Login ID',
    gateway_password: 'Gateway Password / Transaction Key',
    gateway_option1: 'Gateway Option 1',
    gateway_option2: 'Gateway Option 2',
    gateway_option3: 'Gateway Option 3',
    gateway_option4: 'Gateway Option 4',
    gateway_option5: 'Gateway Option 5',
    gateway_auth_full_amount: 'Authorize Full Amount',
    gateway_auth_x_days: 'Auth Expiry Days',
    gateway_avs_mismatch: 'AVS Mismatch Action',
    gateway_service_location: 'Service Location / URL',
    gateway_partner: 'Gateway Partner',
    gateway_security_key: 'Security Key',
    gateway_payer_auth: 'Payer Authentication',
    gateway_get_token: 'Get Token',
    gateway_auth_amount: 'Auth Amount',
    gateway_custom_fields: 'Custom Fields',
  };

  const descriptionMap: Record<string, string> = {
    payment_gateway: 'Select which payment gateway processes your transactions.',
    tokenize_cc_numbers: 'Store tokenized versions of credit card numbers for recurring billing.',
    authorize_cim: 'Enable Authorize.net Customer Information Manager for saved payment profiles.',
    authorize_cim_env: 'Set to "production" for live or "sandbox" for testing.',
    gateway_username: 'Your payment gateway API login ID or username.',
    gateway_password: 'Your payment gateway transaction key or password.',
    gateway_auth_full_amount: 'Authorize the full order amount at checkout.',
    gateway_auth_x_days: 'Number of days before the authorization expires.',
    gateway_avs_mismatch: 'Action to take when AVS (Address Verification) fails.',
    gateway_service_location: 'Gateway API endpoint URL.',
    gateway_security_key: 'Additional security key for gateway authentication.',
    gateway_payer_auth: 'Enable 3D Secure / Verified by Visa / Mastercard SecureCode.',
  };

  const yesNoFields = ['tokenize_cc_numbers', 'authorize_cim', 'payment_app_store_use',
    'payment_app_store_save_disabled', 'gateway_auth_full_amount', 'gateway_payer_auth', 'gateway_get_token'];

  const passwordFields = ['gateway_password', 'gateway_security_key'];

  const renderToggle = (key: string) => {
    const value = options[key] ?? '';
    const isYes = value.toLowerCase() === 'y' || value === '1' || value.toLowerCase() === 'yes';
    const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const desc = descriptionMap[key];

    return (
      <div key={key} style={{ marginBottom: '18px', padding: '12px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <label style={{ fontWeight: 600, marginBottom: '2px', display: 'block' }}>{label}</label>
            {desc && <small className="text-muted">{desc}</small>}
          </div>
          <div
            onClick={() => handleChange(key, isYes ? 'n' : 'y')}
            style={{
              width: '52px', height: '28px', borderRadius: '14px', cursor: 'pointer',
              background: isYes ? '#5cb85c' : '#ccc', position: 'relative', transition: 'background 0.2s',
              flexShrink: 0, marginLeft: '16px',
            }}
          >
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '3px', left: isYes ? '27px' : '3px',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
        <div style={{ marginTop: '4px' }}>
          <span className={`label label-${isYes ? 'success' : 'default'}`} style={{ fontSize: '11px' }}>
            {isYes ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    );
  };

  const renderField = (key: string) => {
    if (yesNoFields.includes(key)) return renderToggle(key);

    const value = options[key] ?? '';
    const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const desc = descriptionMap[key];
    const isPassword = passwordFields.includes(key);
    const isShowing = showPasswords[key] || false;

    if (key === 'authorize_cim_env') {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <select className="form-control" value={value} onChange={(e) => handleChange(key, e.target.value)}
            style={{ maxWidth: '300px', marginTop: '4px' }}>
            <option value="">-- Select --</option>
            <option value="production">Production (Live)</option>
            <option value="sandbox">Sandbox (Testing)</option>
          </select>
        </div>
      );
    }

    if (key === 'gateway_avs_mismatch') {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <select className="form-control" value={value} onChange={(e) => handleChange(key, e.target.value)}
            style={{ maxWidth: '300px', marginTop: '4px' }}>
            <option value="">-- Select --</option>
            <option value="reject">Reject Transaction</option>
            <option value="accept">Accept Transaction</option>
            <option value="review">Flag for Review</option>
          </select>
        </div>
      );
    }

    return (
      <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
        <label style={{ fontWeight: 600 }}>{label}</label>
        {desc && <div><small className="text-muted">{desc}</small></div>}
        <div style={{ position: 'relative', maxWidth: '500px', marginTop: '4px' }}>
          <input type={isPassword && !isShowing ? 'password' : 'text'} className="form-control" value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ paddingRight: isPassword ? '40px' : undefined }} />
          {isPassword && (
            <button type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, [key]: !isShowing }))}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#666',
              }}>
              <i className={`fa fa-eye${isShowing ? '-slash' : ''}`}></i>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading gateway options...</p>
    </div>
  );

  // Group fields
  const gatewayTypeFields = ['payment_gateway', 'gateway_type'];
  const credentialFields = ['gateway_username', 'gateway_password', 'gateway_partner', 'gateway_security_key', 'gateway_service_location'];
  const authFields = ['gateway_auth_full_amount', 'gateway_auth_x_days', 'gateway_auth_amount', 'gateway_avs_mismatch', 'gateway_payer_auth', 'gateway_get_token'];
  const tokenFields = ['tokenize_cc_numbers', 'authorize_cim', 'authorize_cim_env'];
  const appStoreFields = ['payment_app_store_use', 'payment_app_store_config_id', 'payment_app_store_config', 'payment_app_store_save_disabled'];
  const optionFields = ['gateway_option1', 'gateway_option2', 'gateway_option3', 'gateway_option4', 'gateway_option5', 'gateway_custom_fields'];
  const allKnownFields = [...gatewayTypeFields, ...credentialFields, ...authFields, ...tokenFields, ...appStoreFields, ...optionFields];
  const uncategorized = Object.keys(options).filter(k => !allKnownFields.includes(k));

  const renderSection = (title: string, icon: string, color: string, desc: string, fields: string[]) => {
    const available = fields.filter(k => k in options);
    if (available.length === 0) return null;
    return (
      <div className="panel panel-default" style={{ marginBottom: '20px' }} key={title}>
        <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: `2px solid ${color}` }}>
          <h3 className="panel-title">
            <i className={`fa ${icon}`} style={{ color, marginRight: '8px' }}></i>
            {title}
          </h3>
          <small className="text-muted">{desc}</small>
        </div>
        <div className="panel-body">
          {available.map(k => renderField(k))}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-exchange" style={{ color: '#337ab7' }}></i> Payment Gateways</h1>
          <p className="text-muted">Configure your payment gateway integration and processing settings.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {renderSection('Gateway Selection', 'fa-plug', '#337ab7', 'Select and configure your payment processing gateway.', gatewayTypeFields)}
            {renderSection('Gateway Credentials', 'fa-key', '#f0ad4e', 'API credentials for authenticating with your gateway.', credentialFields)}
            {renderSection('Authorization & Security', 'fa-shield', '#d9534f', 'Configure authorization, AVS, and payer authentication settings.', authFields)}
            {renderSection('Tokenization & CIM', 'fa-lock', '#5cb85c', 'Credit card tokenization and Customer Information Manager settings.', tokenFields)}
            {renderSection('Payment App Store', 'fa-shopping-bag', '#5bc0de', 'Payment App Store integration settings.', appStoreFields)}
            {renderSection('Gateway Options', 'fa-sliders', '#777', 'Additional gateway-specific options and custom fields.', optionFields)}

            {uncategorized.length > 0 && renderSection('Other Settings', 'fa-cogs', '#999', 'Additional gateway settings.', uncategorized)}

            {Object.keys(options).length === 0 && (
              <div className="panel panel-default">
                <div className="panel-body">
                  <p className="text-muted text-center"><i className="fa fa-info-circle"></i> No payment gateway options found for this store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Gateway Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
