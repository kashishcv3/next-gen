'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ShippingOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/options');
      setOptions(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load shipping options');
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
      await api.post('/shipping/options', options);
      setSuccess('Shipping options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save options');
    } finally {
      setSaving(false);
    }
  };

  const labelMap: Record<string, string> = {
    ship_calc: 'Shipping Calculation Method',
    ship_calculator: 'Shipping Calculator',
    vendor_ship_calc: 'Vendor Shipping Calculation',
    use_ship_on: 'Calculate Shipping Based On',
    shipping_type: 'Shipping Type / Ship Area',
    ship_territories: 'Ship Territories',
    ship_apo: 'Allow APO/FPO Shipping',
    ship_address_confirm: 'Address Confirmation',
    ship_address_member_copy: 'Copy Shipping to Member Address',
    ship_address_confirm_real: 'Real-time Address Verification',
    ship_address_confirm_real_key: 'Address Verification API Key',
    ship_address_confirm_real_key_live: 'Address Verification Live Key',
    shipworks_enable: 'Enable ShipWorks Integration',
    shipworks_statuscodes: 'ShipWorks Status Codes',
    origin_address: 'Origin / Ship-From Address',
  };

  const descriptionMap: Record<string, string> = {
    ship_calc: 'How should shipping be calculated? Note: MOM users should choose "By Ship-to".',
    ship_calculator: 'Select the shipping rate calculator to use.',
    vendor_ship_calc: 'How vendor shipping costs are calculated.',
    use_ship_on: 'Determines what the shipping calculation is based on.',
    shipping_type: 'Choose your shipping area type.',
    ship_territories: 'Define shipping territories.',
    ship_apo: 'Allow shipping to APO/FPO military addresses.',
    ship_address_confirm: 'Require customers to confirm their shipping address.',
    ship_address_member_copy: 'Automatically copy shipping address from member profile.',
    ship_address_confirm_real: 'Enable real-time address verification via API.',
    ship_address_confirm_real_key: 'API key for address verification service.',
    ship_address_confirm_real_key_live: 'Live/production API key for address verification.',
    shipworks_enable: 'Enable ShipWorks shipping management integration.',
    shipworks_statuscodes: 'Status codes to sync with ShipWorks.',
    origin_address: 'The address packages are shipped from. Used for rate calculations.',
  };

  const yesNoFields = ['ship_apo', 'ship_address_confirm', 'ship_address_member_copy',
    'ship_address_confirm_real', 'shipworks_enable', 'ship_calculator', 'vendor_ship_calc',
    'use_ship_on', 'ship_territories'];

  const dropdownFields: Record<string, { label: string; value: string }[]> = {
    ship_calc: [
      { label: 'By Shipping Method', value: 'ship' },
      { label: 'By Ship-to (per address)', value: 'shipto' },
      { label: 'Total Order', value: 'total' },
      { label: 'Per Item', value: 'item' },
    ],
    shipping_type: [
      { label: 'Domestic Only (US)', value: 'us' },
      { label: 'International Only', value: 'in' },
      { label: 'Both Domestic & International', value: 'both' },
    ],
  };

  // Group fields into sections
  const sections = [
    {
      title: 'Shipping Area & Calculation',
      icon: 'fa-globe',
      description: 'Configure how shipping is calculated and what areas you ship to.',
      fields: ['shipping_type', 'ship_calc', 'ship_calculator', 'vendor_ship_calc', 'use_ship_on', 'ship_territories'],
    },
    {
      title: 'APO & Address Options',
      icon: 'fa-map-marker',
      description: 'Configure address handling and verification options.',
      fields: ['ship_apo', 'ship_address_confirm', 'ship_address_member_copy', 'ship_address_confirm_real', 'ship_address_confirm_real_key', 'ship_address_confirm_real_key_live'],
    },
    {
      title: 'Origin Address',
      icon: 'fa-building',
      description: 'The address packages are shipped from, used for carrier rate lookups.',
      fields: ['origin_address'],
    },
    {
      title: 'ShipWorks Integration',
      icon: 'fa-plug',
      description: 'Configure ShipWorks shipping management integration.',
      fields: ['shipworks_enable', 'shipworks_statuscodes'],
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

    if (key === 'origin_address') {
      return (
        <div key={key} className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontWeight: 600 }}>{label}</label>
          {desc && <div><small className="text-muted">{desc}</small></div>}
          <textarea className="form-control" rows={4} value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ maxWidth: '500px', marginTop: '4px' }}
            placeholder="123 Main St&#10;City, State ZIP&#10;Country" />
        </div>
      );
    }

    // Default text input
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

  // Get uncategorized fields (any field from API not in our sections)
  const allSectionFields = sections.flatMap(s => s.fields);
  const uncategorized = Object.keys(options).filter(k => !allSectionFields.includes(k));

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading shipping options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-truck" style={{ color: '#337ab7' }}></i> Shipping Options</h1>
          <p className="text-muted">Configure core shipping calculation, address options, and integrations for this store.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            {sections.map((section) => {
              const sectionFields = section.fields.filter(f => f in options);
              if (sectionFields.length === 0) return null;
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
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Save Shipping Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
