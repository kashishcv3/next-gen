'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StateOption {
  code: string;
  name: string;
}

const PRODUCT_CODE_OPTIONS = [
  { value: 'sku', label: 'SKU' },
  { value: 'generic_1', label: 'Generic 1' },
  { value: 'generic_2', label: 'Generic 2' },
  { value: 'generic_3', label: 'Generic 3' },
  { value: 'generic_4', label: 'Generic 4' },
  { value: 'generic_5', label: 'Generic 5' },
];

export default function MachTaxRateToolPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [allStates, setAllStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Dual-listbox state
  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);
  const [taxStates, setTaxStates] = useState<string[]>([]);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/rate-tool/mach');
      const data = res.data.data || {};
      const states = res.data.states || {};
      setOptions(data);
      setAllStates(Object.entries(states).map(([code, name]) => ({ code, name: name as string })));

      const statesList = data.cch_states ? data.cch_states.split('|').filter(Boolean) : [];
      setTaxStates(statesList);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Dual-listbox helpers
  const availableStates = allStates.filter(s =>
    !taxStates.includes(s.code) && !taxStates.includes('ALL')
  );

  const moveToSelected = (codes: string[]) => {
    if (codes.includes('ALL')) {
      setTaxStates(['ALL']);
    } else {
      setTaxStates(prev => {
        const newSet = new Set([...prev.filter(s => s !== 'ALL'), ...codes]);
        return Array.from(newSet);
      });
    }
    setSelectedRight([]);
  };

  const moveToAvailable = (codes: string[]) => {
    setTaxStates(prev => prev.filter(s => !codes.includes(s)));
    setSelectedLeft([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      const payload: Record<string, string> = { ...options };
      payload.cch_states = taxStates.includes('ALL') ? 'ALL' : taxStates.join('|');
      await api.post('/tax/rate-tool/mach', payload);
      setSuccess('Mach tax settings saved successfully');
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
          <h1>CCH Sales Tax SaaS (Mach)</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            {/* Options Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enable API</label>
                  <br />
                  <RadioYesNo name="cch_rate_calc" value={options.cch_rate_calc || 'n'}
                    onChange={(val) => handleChange('cch_rate_calc', val)} />
                </div>
                <div className="form-group">
                  <label>Company/Entity ID</label>
                  <input type="text" className="form-control" value={options.cch_company_id || ''}
                    onChange={(e) => handleChange('cch_company_id', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Product Code Field</label>
                  <select className="form-control" value={options.cch_product_code || 'sku'}
                    onChange={(e) => handleChange('cch_product_code', e.target.value)}>
                    {PRODUCT_CODE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Post Invoice on Order Complete</label>
                  <br />
                  <RadioYesNo name="cch_post_invoice" value={options.cch_post_invoice || 'n'}
                    onChange={(val) => handleChange('cch_post_invoice', val)} />
                </div>

                <div className="form-group">
                  <label>Tax States</label>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <select
                            className="form-control form-control-inline"
                            multiple
                            size={10}
                            value={selectedLeft}
                            onChange={(e) => setSelectedLeft(Array.from(e.target.selectedOptions, o => o.value))}
                            style={{ minWidth: '200px' }}
                          >
                            {taxStates.map(code => (
                              <option key={code} value={code}>
                                {code === 'ALL' ? 'All States' : (allStates.find(s => s.code === code)?.name || code)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center', padding: '0 10px' }}>
                          <button type="button" className="btn btn-primary btn-sm" style={{ display: 'block', marginBottom: '4px' }}
                            onClick={() => moveToSelected(selectedRight)}>
                            &lt;&lt;
                          </button>
                          <button type="button" className="btn btn-primary btn-sm" style={{ display: 'block' }}
                            onClick={() => moveToAvailable(selectedLeft)}>
                            &gt;&gt;
                          </button>
                        </td>
                        <td>
                          <select
                            className="form-control"
                            multiple
                            size={10}
                            value={selectedRight}
                            onChange={(e) => setSelectedRight(Array.from(e.target.selectedOptions, o => o.value))}
                            style={{ minWidth: '200px' }}
                          >
                            {!taxStates.includes('ALL') && (
                              <option value="ALL">All States</option>
                            )}
                            {availableStates.map(s => (
                              <option key={s.code} value={s.code}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '8px' }}>
                    <label>
                      <input type="checkbox" value="y"
                        checked={options.cch_tax_states_alt === 'y'}
                        onChange={(e) => handleChange('cch_tax_states_alt', e.target.checked ? 'y' : 'n')}
                      />&nbsp;Use admin tax settings for remaining states
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* API Information Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Sales Tax SaaS API Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" value={options.cch_user || ''}
                    onChange={(e) => handleChange('cch_user', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="text" className="form-control" value={options.cch_pass || ''}
                    onChange={(e) => handleChange('cch_pass', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Ship-from Address Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Ship-from Address</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Address 1</label>
                  <input type="text" className="form-control" value={options.cch_address1 || ''}
                    onChange={(e) => handleChange('cch_address1', e.target.value)} />
                  <p className="help-block">Ex: 1 Main St STE 103</p>
                </div>
                <div className="form-group">
                  <label>Address 2</label>
                  <input type="text" className="form-control" value={options.cch_address2 || ''}
                    onChange={(e) => handleChange('cch_address2', e.target.value)} />
                  <p className="help-block">Ex: Colorado Springs, CO 80919</p>
                </div>
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
