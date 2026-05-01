'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function FulfillmentOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/fulfillment/options');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load fulfillment options');
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
      await api.post('/fulfillment/options', options);
      setSuccess('Fulfillment options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save options');
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    fulfillment_enabled: 'Enable Fulfillment',
    fulfillment_service: 'Fulfillment Service',
    fulfillment_api_key: 'Fulfillment API Key',
    fulfillment_warehouse: 'Warehouse / Location',
    auto_fulfill: 'Auto-Fulfill Orders',
    send_tracking: 'Send Tracking Info to Customers',
    fulfillment_email_notify: 'Email Notification on Fulfillment',
  };

  const descriptionMap: Record<string, string> = {
    fulfillment_enabled: 'Enable or disable the fulfillment integration.',
    fulfillment_service: 'Select the fulfillment service provider.',
    fulfillment_api_key: 'API key for the fulfillment service.',
    fulfillment_warehouse: 'Warehouse or location code for fulfillment.',
    auto_fulfill: 'Automatically fulfill orders when they are placed.',
    send_tracking: 'Send tracking information to customers via email.',
    fulfillment_email_notify: 'Send email notifications when items are fulfilled.',
  };

  const yesNoFields = ['fulfillment_enabled', 'auto_fulfill', 'send_tracking', 'fulfillment_email_notify'];

  const renderToggle = (key: string) => {
    const value = options[key] ?? '';
    const isYes = value.toLowerCase() === 'y' || value === '1' || value.toLowerCase() === 'yes';
    const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const desc = descriptionMap[key];

    return (
      <div key={key} className="form-group" style={{ marginBottom: '18px', padding: '12px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
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

  const renderTextField = (key: string) => {
    const value = options[key] ?? '';
    const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const desc = descriptionMap[key];

    return (
      <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
        <label style={{ fontWeight: 600 }}>{label}</label>
        {desc && <div><small className="text-muted">{desc}</small></div>}
        <input type="text" className="form-control" value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          style={{ maxWidth: '500px', marginTop: '4px' }} />
      </div>
    );
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading fulfillment options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-cube" style={{ color: '#337ab7' }}></i> Fulfillment Options</h1>
          <p className="text-muted">Configure order fulfillment settings and integrations.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-cog" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Fulfillment Settings
                </h3>
                <small className="text-muted">Enable and configure fulfillment for this store.</small>
              </div>
              <div className="panel-body">
                {renderToggle('fulfillment_enabled')}
                {renderTextField('fulfillment_service')}
                {renderTextField('fulfillment_api_key')}
                {renderTextField('fulfillment_warehouse')}
              </div>
            </div>

            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                <h3 className="panel-title">
                  <i className="fa fa-envelope" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                  Automation & Notifications
                </h3>
                <small className="text-muted">Configure automatic fulfillment and customer notifications.</small>
              </div>
              <div className="panel-body">
                {renderToggle('auto_fulfill')}
                {renderToggle('send_tracking')}
                {renderToggle('fulfillment_email_notify')}
              </div>
            </div>

            {/* Render any extra fields from the API not in our known lists */}
            {Object.keys(options).filter(k => !Object.keys(labelMap).includes(k)).length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #999' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#999', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {Object.keys(options).filter(k => !Object.keys(labelMap).includes(k)).map(k =>
                    renderTextField(k)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Fulfillment Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
