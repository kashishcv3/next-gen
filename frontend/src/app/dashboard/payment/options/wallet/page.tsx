'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WalletPaymentMethodsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const walletServices = [
    {
      enableKey: 'enable_google_pay',
      configKey: 'google_pay_config',
      name: 'Google Pay',
      icon: 'fa-google',
      color: '#4285F4',
      description: 'Allow customers to pay using Google Pay.',
    },
    {
      enableKey: 'enable_apple_pay',
      configKey: 'apple_pay_config',
      name: 'Apple Pay',
      icon: 'fa-apple',
      color: '#000',
      description: 'Allow customers to pay using Apple Pay.',
    },
    {
      enableKey: 'enable_venmo',
      configKey: 'venmo_config',
      name: 'Venmo',
      icon: 'fa-money',
      color: '#3D95CE',
      description: 'Allow customers to pay using Venmo.',
    },
  ];

  const renderToggle = (key: string, isYes: boolean) => (
    <div
      onClick={() => handleChange(key, isYes ? 'n' : 'y')}
      style={{
        width: '52px', height: '28px', borderRadius: '14px', cursor: 'pointer',
        background: isYes ? '#5cb85c' : '#ccc', position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px', left: isYes ? '27px' : '3px',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  );

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading wallet settings...</p>
    </div>
  );

  // Collect any keys not handled by walletServices
  const handledKeys = walletServices.flatMap(w => [w.enableKey, w.configKey]);
  const otherKeys = Object.keys(options).filter(k => !handledKeys.includes(k));

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
        <div className="row">
          <div className="col-lg-9">
            {walletServices.map(wallet => {
              const hasEnable = wallet.enableKey in options;
              const hasConfig = wallet.configKey in options;
              if (!hasEnable && !hasConfig) return null;

              const enableVal = options[wallet.enableKey] ?? '';
              const isEnabled = enableVal.toLowerCase() === 'y' || enableVal === '1' || enableVal.toLowerCase() === 'yes';

              return (
                <div key={wallet.name} className="panel panel-default" style={{ marginBottom: '20px' }}>
                  <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: `2px solid ${isEnabled ? wallet.color : '#ccc'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 className="panel-title" style={{ margin: 0 }}>
                        <i className={`fa ${wallet.icon}`} style={{ color: wallet.color, marginRight: '8px' }}></i>
                        {wallet.name}
                      </h3>
                      {hasEnable && renderToggle(wallet.enableKey, isEnabled)}
                    </div>
                    <small className="text-muted">{wallet.description}</small>
                  </div>
                  <div className="panel-body" style={{ opacity: isEnabled ? 1 : 0.5 }}>
                    {hasEnable && (
                      <div style={{ marginBottom: '12px' }}>
                        <span className={`label label-${isEnabled ? 'success' : 'default'}`} style={{ fontSize: '12px' }}>
                          <i className={`fa fa-${isEnabled ? 'check-circle' : 'times-circle'}`}></i> {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}
                    {hasConfig && (
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ fontWeight: 600 }}>{wallet.name} Configuration</label>
                        <div><small className="text-muted">JSON configuration or settings for {wallet.name} integration.</small></div>
                        <textarea className="form-control" rows={3} value={options[wallet.configKey] || ''}
                          onChange={(e) => handleChange(wallet.configKey, e.target.value)}
                          style={{ maxWidth: '500px', marginTop: '4px', fontFamily: 'monospace', fontSize: '13px' }}
                          placeholder={`{"merchantId": "...", "environment": "PRODUCTION"}`}
                          disabled={!isEnabled} />
                      </div>
                    )}
                    {!isEnabled && (
                      <div className="alert alert-info" style={{ marginTop: '10px', marginBottom: '0' }}>
                        <i className="fa fa-info-circle"></i> Enable {wallet.name} to configure its settings.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Other uncategorized fields */}
            {otherKeys.length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {otherKeys.map(key => {
                    const value = options[key] ?? '';
                    return (
                      <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
                        <label style={{ fontWeight: 600 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <input type="text" className="form-control" value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          style={{ maxWidth: '500px', marginTop: '4px' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {Object.keys(options).length === 0 && (
              <div className="panel panel-default">
                <div className="panel-body">
                  <p className="text-muted text-center"><i className="fa fa-info-circle"></i> No wallet payment options found for this store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Wallet Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
