'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function CustomTaxRateToolPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/rate-tool/custom');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
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
      await api.post('/tax/rate-tool/custom', options);
      setSuccess('Custom tax rate tool saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const RadioYesNo = ({ name, value, onChange }: { name: string; value: string; onChange: (val: string) => void }) => (
    <span>
      <label className="radio-inline">
        <input type="radio" name={name} value="y" checked={value === 'y'} onChange={() => onChange('y')} /> Yes
      </label>
      &nbsp;
      <label className="radio-inline">
        <input type="radio" name={name} value="n" checked={value !== 'y'} onChange={() => onChange('n')} /> No
      </label>
    </span>
  );

  const showV2 = options.tax_api_version === '2';
  const showAuth = options.tax_api_auth === 'y';

  if (loading) return <div className="container-fluid" style={{ padding: '20px' }}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Custom Tax Calculation</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enable API</label>
                  <br />
                  <RadioYesNo name="tax_api_calc" value={options.tax_api_calc || 'n'}
                    onChange={(val) => handleChange('tax_api_calc', val)} />
                </div>
                <div className="form-group">
                  <label>API V2</label>
                  <br />
                  <label className="radio-inline">
                    <input type="radio" name="tax_api_version" value="1"
                      checked={(options.tax_api_version || '1') !== '2'}
                      onChange={() => handleChange('tax_api_version', '1')} /> V1
                  </label>
                  &nbsp;
                  <label className="radio-inline">
                    <input type="radio" name="tax_api_version" value="2"
                      checked={options.tax_api_version === '2'}
                      onChange={() => handleChange('tax_api_version', '2')} /> V2
                  </label>
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input type="text" className="form-control form-control-inline" name="tax_url"
                    value={options.tax_url || ''} size={65}
                    onChange={(e) => handleChange('tax_url', e.target.value)} />
                  <p className="help-block">
                    OR, set up tables here: <Link href="/dashboard/tax/list">Tax Tables</Link>
                  </p>
                </div>

                {showV2 && (
                  <>
                    <div className="form-group">
                      <label>Authenticate</label>
                      <br />
                      <RadioYesNo name="tax_api_auth" value={options.tax_api_auth || 'n'}
                        onChange={(val) => handleChange('tax_api_auth', val)} />
                    </div>
                    {showAuth && (
                      <>
                        <div className="form-group">
                          <label>Username</label>
                          <input type="text" className="form-control form-control-inline"
                            value={options.tax_api_username || ''} size={65}
                            onChange={(e) => handleChange('tax_api_username', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input type="text" className="form-control form-control-inline"
                            value={options.tax_api_password || ''} size={65}
                            onChange={(e) => handleChange('tax_api_password', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>API Key</label>
                          <input type="text" className="form-control form-control-inline"
                            value={options.tax_api_key || ''} size={65}
                            onChange={(e) => handleChange('tax_api_key', e.target.value)} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
