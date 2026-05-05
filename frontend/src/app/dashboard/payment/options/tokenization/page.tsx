'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const CURRENCY_CODES: Record<string, string> = {
  '840': 'USD - US Dollar',
  '124': 'CAD - Canadian Dollar',
  '826': 'GBP - British Pound',
  '978': 'EUR - Euro',
  '036': 'AUD - Australian Dollar',
  '392': 'JPY - Japanese Yen',
  '756': 'CHF - Swiss Franc',
};

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

  const renderRadio = (name: string, label: string, value: string, description?: string) => {
    const isYes = value.toLowerCase() === 'y' || value === '1' || value.toLowerCase() === 'yes';
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

  const isFDEnabled = (options['enable_firstdata_compass'] || '').toLowerCase() === 'y';

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
          <p className="text-muted">Configure credit card tokenization and payment profile storage.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            {/* FirstData Compass Panel */}
            <div className="panel-group" id="accordian-token">
              <div className="panel panel-primary">
                <div className="panel-heading" style={{ cursor: 'pointer' }}>
                  <h3 className="panel-title">
                    <a data-toggle="collapse" href="#collapseFD">
                      <i className="fa fa-toggle-down" style={{ marginRight: '6px' }}></i>
                      Firstdata Compass
                    </a>
                  </h3>
                </div>
                <div id="collapseFD" className="panel-collapse collapse in">
                  {/* Enable toggle - always visible */}
                  <div className="panel-body">
                    {renderRadio(
                      'enable_firstdata_compass',
                      'Enable FirstData Compass Tokenization',
                      options['enable_firstdata_compass'] || 'n',
                      'Enable or disable FirstData Compass tokenization service.'
                    )}
                  </div>

                  {/* Config fields - shown only when enabled */}
                  {isFDEnabled && (
                    <div className="panel-body">
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Username</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_username'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_username', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Password</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_password'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_password', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Currency Code</label>
                        <select className="form-control"
                          value={options['firstdata_compass_currency_code'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_currency_code', e.target.value)}
                          style={{ maxWidth: '300px' }}>
                          <option value="">-- Select --</option>
                          {Object.entries(CURRENCY_CODES).map(([code, label]) => (
                            <option key={code} value={code}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Token Type Code</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_token_type'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_token_type', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>FirstData Compass URL</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_service_url'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_service_url', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>FirstData Compass Test URL</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_service_test_url'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_service_test_url', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      {renderRadio(
                        'firstdata_authorize',
                        'Enable FirstData Compass Authorization',
                        options['firstdata_authorize'] || 'n'
                      )}

                      {renderRadio(
                        'firstdata_compass_testing',
                        'Testing',
                        options['firstdata_compass_testing'] || 'n',
                        'Set to Yes for sandbox/testing mode.'
                      )}

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Private Key Passphrase</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_passphrase'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_passphrase', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Service ID</label>
                        <input className="form-control" type="text"
                          value={options['firstdata_compass_service_id'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_service_id', e.target.value)}
                          style={{ maxWidth: '500px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>CA-Chain.pem</label>
                        <textarea className="form-control" rows={4}
                          value={options['firstdata_compass_ca_cert'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_ca_cert', e.target.value)}
                          style={{ maxWidth: '500px', fontFamily: 'monospace', fontSize: '13px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Client Certificate</label>
                        <textarea className="form-control" rows={4}
                          value={options['firstdata_compass_client_cert'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_client_cert', e.target.value)}
                          style={{ maxWidth: '500px', fontFamily: 'monospace', fontSize: '13px' }} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 600 }}>Client Key</label>
                        <textarea className="form-control" rows={4}
                          value={options['firstdata_compass_client_key'] || ''}
                          onChange={(e) => handleChange('firstdata_compass_client_key', e.target.value)}
                          style={{ maxWidth: '500px', fontFamily: 'monospace', fontSize: '13px' }} />
                      </div>
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
