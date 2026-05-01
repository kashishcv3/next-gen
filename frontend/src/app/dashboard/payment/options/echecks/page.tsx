'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ElectronicChecksPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/echecks');
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
      await api.post('/payment/options/echecks', options);
      setSuccess('Electronic check options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    echeck: 'Enable Electronic Checks',
    echeck_user: 'E-Check API Username',
    echeck_trans_key: 'E-Check Transaction Key',
  };

  const descriptionMap: Record<string, string> = {
    echeck: 'Enable electronic check (ACH) payments for this store.',
    echeck_user: 'Your Authorize.net API login ID for e-check processing.',
    echeck_trans_key: 'Your Authorize.net transaction key for e-check processing.',
  };

  const yesNoFields = ['echeck'];

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
      <p><i className="fa fa-spinner fa-spin"></i> Loading e-check options...</p>
    </div>
  );

  const isEnabled = (options['echeck'] ?? '').toLowerCase() === 'y';

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-bank" style={{ color: '#337ab7' }}></i> Electronic Checks</h1>
          <p className="text-muted">Configure electronic check (ACH) payment options for this store.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {/* Enable/Disable Section */}
            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: `2px solid ${isEnabled ? '#5cb85c' : '#ccc'}` }}>
                <h3 className="panel-title">
                  <i className={`fa fa-${isEnabled ? 'check-circle' : 'circle-o'}`} style={{ color: isEnabled ? '#5cb85c' : '#ccc', marginRight: '8px' }}></i>
                  E-Check Status
                </h3>
              </div>
              <div className="panel-body">
                {'echeck' in options && renderToggle('echeck')}
              </div>
            </div>

            {/* API Credentials Section */}
            <div className="panel panel-default" style={{ marginBottom: '20px', opacity: isEnabled ? 1 : 0.6 }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #f0ad4e' }}>
                <h3 className="panel-title">
                  <i className="fa fa-key" style={{ color: '#f0ad4e', marginRight: '8px' }}></i>
                  API Credentials
                </h3>
                <small className="text-muted">Authorize.net credentials for e-check processing.</small>
              </div>
              <div className="panel-body">
                {!isEnabled && (
                  <div className="alert alert-info" style={{ marginBottom: '15px' }}>
                    <i className="fa fa-info-circle"></i> Enable electronic checks above to configure API credentials.
                  </div>
                )}
                {'echeck_user' in options && (
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ fontWeight: 600 }}>{labelMap['echeck_user']}</label>
                    <div><small className="text-muted">{descriptionMap['echeck_user']}</small></div>
                    <input type="text" className="form-control" value={options['echeck_user'] || ''}
                      onChange={(e) => handleChange('echeck_user', e.target.value)}
                      style={{ maxWidth: '400px', marginTop: '4px' }}
                      placeholder="Enter API Login ID" disabled={!isEnabled} />
                  </div>
                )}
                {'echeck_trans_key' in options && (
                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ fontWeight: 600 }}>{labelMap['echeck_trans_key']}</label>
                    <div><small className="text-muted">{descriptionMap['echeck_trans_key']}</small></div>
                    <input type="password" className="form-control" value={options['echeck_trans_key'] || ''}
                      onChange={(e) => handleChange('echeck_trans_key', e.target.value)}
                      style={{ maxWidth: '400px', marginTop: '4px' }}
                      placeholder="Enter Transaction Key" disabled={!isEnabled} />
                  </div>
                )}
                {!('echeck_user' in options) && !('echeck_trans_key' in options) && (
                  <p className="text-muted">No API credential fields available.</p>
                )}
              </div>
            </div>

            {/* Any other fields */}
            {Object.keys(options).filter(k => !['echeck', 'echeck_user', 'echeck_trans_key'].includes(k)).length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {Object.keys(options).filter(k => !['echeck', 'echeck_user', 'echeck_trans_key'].includes(k)).map(key => (
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
                  <p className="text-muted text-center"><i className="fa fa-info-circle"></i> No e-check options found for this store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save E-Check Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
