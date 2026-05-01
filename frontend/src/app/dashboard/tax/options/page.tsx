'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function TaxOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/options');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tax options');
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
      await api.post('/tax/options', options);
      setSuccess('Tax options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save options');
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    tax_method: 'Tax Calculation Method',
    tax_inclusive: 'Tax Inclusive Pricing',
    default_tax_rate: 'Default Tax Rate (%)',
    tax_on_shipping: 'Apply Tax on Shipping',
    tax_on_handling: 'Apply Tax on Handling',
    tax_display: 'Tax Display Mode',
    tax_exempt_enabled: 'Enable Tax Exemptions',
    tax_id_required: 'Require Tax ID',
    tax_rounding: 'Tax Rounding Method',
  };

  const descriptionMap: Record<string, string> = {
    tax_method: 'How should tax be calculated for orders?',
    tax_inclusive: 'Include tax in product prices (VAT-style).',
    default_tax_rate: 'Default tax rate applied when no specific rate is found.',
    tax_on_shipping: 'Should tax be applied to shipping charges?',
    tax_on_handling: 'Should tax be applied to handling fees?',
    tax_display: 'How tax amounts are shown to customers.',
    tax_exempt_enabled: 'Allow customers to apply for tax-exempt status.',
    tax_id_required: 'Require customers to provide a Tax ID for exemption.',
    tax_rounding: 'How to round tax amounts (up, down, or nearest).',
  };

  const yesNoFields = ['tax_inclusive', 'tax_on_shipping', 'tax_on_handling', 'tax_exempt_enabled', 'tax_id_required'];

  const dropdownFields: Record<string, { label: string; value: string }[]> = {
    tax_method: [
      { label: 'Standard', value: 'standard' },
      { label: 'Simplified', value: 'simplified' },
      { label: 'Per Item', value: 'per_item' },
      { label: 'Per Order', value: 'per_order' },
    ],
    tax_display: [
      { label: 'Show Tax Separately', value: 'separate' },
      { label: 'Include Tax in Subtotal', value: 'included' },
      { label: 'Hide Tax', value: 'hidden' },
    ],
    tax_rounding: [
      { label: 'Round to Nearest', value: 'nearest' },
      { label: 'Round Up', value: 'up' },
      { label: 'Round Down', value: 'down' },
    ],
  };

  const sections = [
    {
      title: 'Tax Calculation',
      icon: 'fa-calculator',
      description: 'Configure how taxes are calculated.',
      fields: ['tax_method', 'tax_inclusive', 'default_tax_rate', 'tax_rounding'],
    },
    {
      title: 'Tax Application',
      icon: 'fa-money',
      description: 'Configure what gets taxed.',
      fields: ['tax_on_shipping', 'tax_on_handling', 'tax_display'],
    },
    {
      title: 'Tax Exemptions',
      icon: 'fa-shield',
      description: 'Configure tax exemption options.',
      fields: ['tax_exempt_enabled', 'tax_id_required'],
    },
  ];

  const renderField = (key: string) => {
    const value = options[key] ?? '';
    const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const desc = descriptionMap[key];

    if (yesNoFields.includes(key)) {
      const isYes = value.toLowerCase() === 'y' || value === '1' || value.toLowerCase() === 'yes';
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
    }

    if (dropdownFields[key]) {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <select className="form-control" value={value} onChange={(e) => handleChange(key, e.target.value)}
            style={{ maxWidth: '400px', marginTop: '4px' }}>
            <option value="">-- Select --</option>
            {dropdownFields[key].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (key === 'default_tax_rate') {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <div className="input-group" style={{ maxWidth: '200px', marginTop: '4px' }}>
            <input type="number" step="0.01" className="form-control" value={value}
              onChange={(e) => handleChange(key, e.target.value)} />
            <span className="input-group-addon">%</span>
          </div>
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

  const allSectionFields = sections.flatMap(s => s.fields);
  const uncategorized = Object.keys(options).filter(k => !allSectionFields.includes(k));

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading tax options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-percent" style={{ color: '#337ab7' }}></i> Tax Options</h1>
          <p className="text-muted">Configure tax calculation, application, and exemption settings for this store.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {sections.map((section) => {
              const sectionFields = section.fields.filter(f => f in options || section.fields.includes(f));
              return (
                <div key={section.title} className="panel panel-default" style={{ marginBottom: '20px' }}>
                  <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                    <h3 className="panel-title">
                      <i className={`fa ${section.icon}`} style={{ color: '#337ab7', marginRight: '8px' }}></i>
                      {section.title}
                    </h3>
                    {section.description && <small className="text-muted">{section.description}</small>}
                  </div>
                  <div className="panel-body">
                    {sectionFields.map(f => renderField(f))}
                  </div>
                </div>
              );
            })}

            {uncategorized.length > 0 && (
              <div className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5bc0de' }}>
                  <h3 className="panel-title">
                    <i className="fa fa-cogs" style={{ color: '#5bc0de', marginRight: '8px' }}></i>
                    Additional Settings
                  </h3>
                </div>
                <div className="panel-body">
                  {uncategorized.map(f => renderField(f))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Tax Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
