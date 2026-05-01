'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TokenizationServicesPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/tokenization');
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
      await api.post('/payment/options/tokenization', options);
      setSuccess('Tokenization settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    tokenize_cc_numbers: 'Tokenize Credit Card Numbers',
    authorize_cim: 'Authorize.net CIM (Customer Information Manager)',
    authorize_cim_env: 'CIM Environment',
  };

  const descriptionMap: Record<string, string> = {
    tokenize_cc_numbers: 'Store tokenized versions of credit card numbers for recurring billing and saved payment methods.',
    authorize_cim: 'Enable Authorize.net Customer Information Manager for storing customer payment profiles securely.',
    authorize_cim_env: 'Set the CIM environment to production for live transactions or sandbox for testing.',
  };

  const yesNoFields = ['tokenize_cc_numbers', 'authorize_cim'];

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

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading tokenization settings...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-lock" style={{ color: '#337ab7' }}></i> Tokenization Services</h1>
          <p className="text-muted">Configure credit card tokenization and customer payment profile storage.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {/* Tokenization Toggles */}
            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5cb85c' }}>
                <h3 className="panel-title">
                  <i className="fa fa-shield" style={{ color: '#5cb85c', marginRight: '8px' }}></i>
                  Tokenization Settings
                </h3>
                <small className="text-muted">Enable tokenization to securely store payment information.</small>
              </div>
              <div className="panel-body">
                {Object.keys(options).filter(k => yesNoFields.includes(k)).map(k => renderToggle(k))}
              </div>
            </div>

            {/* CIM Environment */}
            {'authorize_cim_env' in options && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-server" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                    CIM Configuration
                  </h3>
                  <small className="text-muted">Configure the Authorize.net CIM environment.</small>
                </div>
                <div className="panel-body">
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ fontWeight: 600 }}>{labelMap['authorize_cim_env']}</label>
                    <div><small className="text-muted">{descriptionMap['authorize_cim_env']}</small></div>
                    <select className="form-control" value={options['authorize_cim_env'] || ''}
                      onChange={(e) => handleChange('authorize_cim_env', e.target.value)}
                      style={{ maxWidth: '300px', marginTop: '4px' }}>
                      <option value="">-- Select --</option>
                      <option value="production">Production (Live)</option>
                      <option value="sandbox">Sandbox (Testing)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Any uncategorized fields */}
            {Object.keys(options).filter(k => !yesNoFields.includes(k) && k !== 'authorize_cim_env').length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {Object.keys(options).filter(k => !yesNoFields.includes(k) && k !== 'authorize_cim_env').map(key => (
                    <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
                      <label style={{ fontWeight: 600 }}>{labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <input type="text" className="form-control" value={options[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{ maxWidth: '500px', marginTop: '4px' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(options).length === 0 && (
              <div className="panel panel-default">
                <div className="panel-body">
                  <p className="text-muted text-center"><i className="fa fa-info-circle"></i> No tokenization options found for this store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Tokenization Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
