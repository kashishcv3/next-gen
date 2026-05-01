'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CreditCardOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/creditcards');
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
      await api.post('/payment/options/creditcards', options);
      setSuccess('Credit card options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    credit_cards: 'Accepted Credit Cards',
    private_label_name: 'Private Label Card Name',
    private_label_validation: 'Private Label Validation Pattern',
    display_cvv2: 'Display CVV2 Field',
    require_cvv2: 'Require CVV2',
    hide_cc_list: 'Hide Credit Card List',
    payment_gateway_unavailable: 'Gateway Unavailable Message',
  };

  const descriptionMap: Record<string, string> = {
    credit_cards: 'Select which credit cards your store accepts. Multiple cards can be comma-separated (e.g. "Visa,MasterCard,Amex,Discover").',
    private_label_name: 'Name of your private label / store credit card.',
    private_label_validation: 'Regex validation pattern for private label card numbers.',
    display_cvv2: 'Show the CVV2/CVC security code field on the checkout form.',
    require_cvv2: 'Require customers to enter their CVV2/CVC code to complete purchase.',
    hide_cc_list: 'Hide the list of accepted credit cards from the checkout page.',
    payment_gateway_unavailable: 'Message displayed when the payment gateway is unavailable.',
  };

  const yesNoFields = ['display_cvv2', 'require_cvv2', 'hide_cc_list'];

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

    if (key === 'payment_gateway_unavailable') {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <textarea className="form-control" rows={3} value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ maxWidth: '500px', marginTop: '4px' }}
            placeholder="We are currently unable to process credit card payments. Please try again later." />
        </div>
      );
    }

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
      <p><i className="fa fa-spinner fa-spin"></i> Loading credit card options...</p>
    </div>
  );

  const ccFields = ['credit_cards', 'private_label_name', 'private_label_validation'];
  const securityFields = ['display_cvv2', 'require_cvv2', 'hide_cc_list'];
  const otherFields = Object.keys(options).filter(k => !ccFields.includes(k) && !securityFields.includes(k));

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-credit-card" style={{ color: '#337ab7' }}></i> Credit Card Options</h1>
          <p className="text-muted">Configure which credit cards your store accepts and security settings.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {/* Accepted Cards Section */}
            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-credit-card-alt" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Accepted Credit Cards
                </h3>
                <small className="text-muted">Select which credit card types your store accepts.</small>
              </div>
              <div className="panel-body">
                {ccFields.filter(k => k in options).map(k => renderField(k))}
                {ccFields.filter(k => k in options).length === 0 && (
                  <p className="text-muted">No credit card type options available.</p>
                )}
              </div>
            </div>

            {/* Security Settings */}
            {securityFields.some(k => k in options) && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #d9534f' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-shield" style={{ color: '#d9534f', marginRight: '8px' }}></i>
                    Security & Display Settings
                  </h3>
                  <small className="text-muted">Configure CVV2 requirements and card display options.</small>
                </div>
                <div className="panel-body">
                  {securityFields.filter(k => k in options).map(k => renderField(k))}
                </div>
              </div>
            )}

            {/* Other Settings */}
            {otherFields.length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {otherFields.map(k => renderField(k))}
                </div>
              </div>
            )}

            {Object.keys(options).length === 0 && (
              <div className="panel panel-default">
                <div className="panel-body">
                  <p className="text-muted text-center"><i className="fa fa-info-circle"></i> No credit card options found for this store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Credit Card Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
