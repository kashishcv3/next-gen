'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StateOption {
  code: string;
  name: string;
}

export default function CoreTaxOptionsPage() {
  const [taxDiscount, setTaxDiscount] = useState('n');
  const [taxOrderlevelFees, setTaxOrderlevelFees] = useState<string[]>([]);
  const [apiTaxStates, setApiTaxStates] = useState<string[]>([]);
  const [apiTaxStatesAlt, setApiTaxStatesAlt] = useState('n');
  const [allStates, setAllStates] = useState<StateOption[]>([]);
  const [feeOptions, setFeeOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/options/core');
      const data = res.data.data || {};
      const states = res.data.states || {};
      const fees = res.data.fee_options || {};

      setFeeOptions(fees);
      setAllStates(Object.entries(states).map(([code, name]) => ({ code, name: name as string })));

      setTaxDiscount(data.tax_discount || 'n');
      setTaxOrderlevelFees(data.tax_orderlevel_fees ? data.tax_orderlevel_fees.split('|').filter(Boolean) : []);

      const statesList = data.api_tax_states ? data.api_tax_states.split('|').filter(Boolean) : [];
      setApiTaxStates(statesList);
      setApiTaxStatesAlt(data.api_tax_states_alt || 'n');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tax options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      const payload: Record<string, string> = {
        tax_discount: taxDiscount,
        tax_orderlevel_fees: taxOrderlevelFees.join('|'),
        api_tax_states: apiTaxStates.includes('ALL') ? 'ALL' : apiTaxStates.join('|'),
        api_tax_states_alt: apiTaxStatesAlt,
      };
      await api.post('/tax/options/core', payload);
      setSuccess('Core tax options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Dual-listbox helpers
  const availableStates = allStates.filter(s =>
    !apiTaxStates.includes(s.code) && !apiTaxStates.includes('ALL')
  );

  const moveToSelected = (codes: string[]) => {
    if (codes.includes('ALL')) {
      setApiTaxStates(['ALL']);
    } else {
      setApiTaxStates(prev => {
        const newSet = new Set([...prev.filter(s => s !== 'ALL'), ...codes]);
        return Array.from(newSet);
      });
    }
  };

  const moveToAvailable = (codes: string[]) => {
    setApiTaxStates(prev => prev.filter(s => !codes.includes(s)));
  };

  const [selectedLeft, setSelectedLeft] = useState<string[]>([]);
  const [selectedRight, setSelectedRight] = useState<string[]>([]);

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading tax options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Core Tax Options</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div>}

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
                  <label>Calculate Tax Before Discounts</label>
                  <br />
                  <label className="radio-inline">
                    <input type="radio" name="tax_discount" value="y"
                      checked={taxDiscount === 'y'} onChange={() => setTaxDiscount('y')} /> Yes
                  </label>
                  &nbsp;
                  <label className="radio-inline">
                    <input type="radio" name="tax_discount" value="n"
                      checked={taxDiscount !== 'y'} onChange={() => setTaxDiscount('n')} /> No
                  </label>
                  <p className="help-block">Pertains to CV3 tax logic as well as the App Store and Avalara integrations.</p>
                </div>

                <div className="form-group">
                  <label>Enable Order-Level Fees</label>
                  <select
                    className="form-control"
                    multiple
                    size={3}
                    value={taxOrderlevelFees}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                      setTaxOrderlevelFees(selected);
                    }}
                    style={{ maxWidth: '300px' }}
                  >
                    {Object.entries(feeOptions).map(([val, label]) => (
                      <option key={val} value={val}>{label as string}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* API Options Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> API Options</h3>
              </div>
              <div className="panel-body">
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
                            {apiTaxStates.map(code => (
                              <option key={code} value={code}>
                                {code === 'ALL' ? 'All States' : (allStates.find(s => s.code === code)?.name || code)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'center', padding: '0 10px' }}>
                          <button type="button" className="btn btn-primary btn-sm" style={{ display: 'block', marginBottom: '4px' }}
                            onClick={() => { moveToSelected(selectedRight); setSelectedRight([]); }}>
                            &lt;&lt;
                          </button>
                          <button type="button" className="btn btn-primary btn-sm" style={{ display: 'block' }}
                            onClick={() => { moveToAvailable(selectedLeft); setSelectedLeft([]); }}>
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
                            {!apiTaxStates.includes('ALL') && (
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
                        checked={apiTaxStatesAlt === 'y'}
                        onChange={(e) => setApiTaxStatesAlt(e.target.checked ? 'y' : 'n')}
                      />&nbsp;Use admin tax settings for remaining states
                    </label>
                  </div>
                </div>
                <p className="help-block">
                  <i className="fa fa-info-circle"></i>&nbsp;These two settings override the equivalent App Store, CCH and Avalara settings
                </p>
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
