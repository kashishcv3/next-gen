'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function SezzleOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/checkout/options/sezzle');
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
      await api.post('/checkout/options/sezzle', options);
      setSuccess('Sezzle options saved successfully');
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
      <p><i className="fa fa-spinner fa-spin"></i> Loading Sezzle options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-credit-card" style={{ color: '#337ab7' }}></i> Sezzle Options</h1>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
              </div>
              <div className="panel-body">
                {renderRadio('sezzle', 'Enable Option', options['sezzle'] || 'n')}
                {renderRadio('sezzle_testing', 'Testing', options['sezzle_testing'] || 'n')}

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Public Key</label>
                  <input className="form-control" type="text"
                    value={options['sezzle_public_key'] || ''}
                    onChange={(e) => handleChange('sezzle_public_key', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Private Key</label>
                  <input className="form-control" type="text"
                    value={options['sezzle_private_key'] || ''}
                    onChange={(e) => handleChange('sezzle_private_key', e.target.value)}
                    style={{ maxWidth: '500px' }} />
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
