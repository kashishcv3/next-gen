'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AppStoreField {
  form_name: string;
  field_type: string;
  field_size?: number;
  default?: string;
  options?: Record<string, string>;
  help_block?: string;
}

export default function TaxJarRateToolPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [appStoreConf, setAppStoreConf] = useState<Record<string, AppStoreField> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/rate-tool/taxjar');
      const data = res.data.data || {};
      setOptions(data);
      if (res.data.app_store_conf?.input_fields) {
        setAppStoreConf(res.data.app_store_conf.input_fields);
      }
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
      const payload: Record<string, string> = { ...options };
      // Serialize app store config fields into tax_app_store_conf
      if (appStoreConf) {
        const confObj: Record<string, string> = {};
        Object.keys(appStoreConf).forEach(fieldName => {
          const fieldVar = `taxjar-${fieldName}`;
          confObj[fieldName] = options[fieldVar] || '';
        });
        payload.tax_app_store_conf = JSON.stringify(confObj);
      }
      await api.post('/tax/rate-tool/taxjar', payload);
      setSuccess('TaxJar settings saved successfully');
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

  if (loading) return <div className="container-fluid" style={{ padding: '20px' }}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>TaxJar</h1>
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
                  <RadioYesNo name="tax_app_store_calc" value={options.tax_app_store_calc || 'n'}
                    onChange={(val) => handleChange('tax_app_store_calc', val)} />
                </div>

                {appStoreConf && Object.entries(appStoreConf).map(([fieldName, fieldVals]) => {
                  const fieldVar = `taxjar-${fieldName}`;
                  return (
                    <div className="form-group" key={fieldName}>
                      <label>{fieldVals.form_name}</label>
                      {fieldVals.field_type === 'text' && (
                        <input type="text" className="form-control form-control-inline"
                          value={options[fieldVar] || ''}
                          size={fieldVals.field_size || undefined}
                          onChange={(e) => handleChange(fieldVar, e.target.value)} />
                      )}
                      {fieldVals.field_type === 'radio' && fieldVals.options && (
                        <>
                          <br />
                          {Object.entries(fieldVals.options).map(([optVal, optLabel]) => (
                            <label className="radio-inline" key={optVal}>
                              <input type="radio" name={fieldVar} value={optVal}
                                checked={(options[fieldVar] || fieldVals.default || '') === optVal}
                                onChange={() => handleChange(fieldVar, optVal)} /> {optLabel}
                            </label>
                          ))}
                        </>
                      )}
                      {fieldVals.help_block && (
                        <p className="help-block">{fieldVals.help_block}</p>
                      )}
                    </div>
                  );
                })}

                {!appStoreConf && (
                  <p className="text-muted"><i className="fa fa-info-circle"></i> No additional configuration fields available for this provider.</p>
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
