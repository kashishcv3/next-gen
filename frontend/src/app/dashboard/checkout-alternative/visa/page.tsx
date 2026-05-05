'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function VisaCheckoutOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/checkout/options/visa');
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
      await api.post('/checkout/options/visa', options);
      setSuccess('Visa Checkout options saved successfully');
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
      <p><i className="fa fa-spinner fa-spin"></i> Loading Visa Checkout options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-credit-card-alt" style={{ color: '#337ab7' }}></i> Visa Checkout Options</h1>
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
                {renderRadio('visa_checkout', 'Enable Option', options['visa_checkout'] || 'n')}
                {renderRadio('visa_testing', 'Testing', options['visa_testing'] || 'n')}

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Visa Checkout API Key</label>
                  <textarea className="form-control" rows={3}
                    value={options['visa_key'] || ''}
                    onChange={(e) => handleChange('visa_key', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Visa Checkout Shared Secret</label>
                  <textarea className="form-control" rows={3}
                    value={options['visa_share'] || ''}
                    onChange={(e) => handleChange('visa_share', e.target.value)}
                    style={{ maxWidth: '500px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Visa Checkout Encryption Key (for token v2 accounts only)</label>
                  <textarea className="form-control" rows={3}
                    value={options['visa_enckey'] || ''}
                    onChange={(e) => handleChange('visa_enckey', e.target.value)}
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
