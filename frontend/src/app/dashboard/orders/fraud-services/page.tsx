'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function FraudServicesPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/orders/options/fraud');
      const data = res.data.data || res.data || {};
      setOptions(data);
      // Auto-expand Sift Science panel if enabled
      if (data.sift_science === 'y') {
        setOpenPanels(prev => ({ ...prev, siftscience: true }));
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load fraud options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null);
    try {
      await api.post('/orders/options/fraud', options);
      setSuccess('Fraud Services saved successfully');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to save');
    }
  };

  const togglePanel = (id: string) => {
    setOpenPanels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    setOpenPanels({ siftscience: newState });
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

  if (loading) return <><h1>Fraud Services</h1><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Fraud Services</h1>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-lg-12">
          <p>
            <button type="button" className="btn btn-primary btn-sm" onClick={toggleAll}>
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form name="fraud_services" method="post" onSubmit={handleSubmit} role="form">
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="accordian-gateways">

              {/* Sift Science Panel */}
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <a href="#" onClick={(e) => { e.preventDefault(); togglePanel('siftscience'); }} style={{ color: '#fff' }}>
                      <i className={`fa fa-toggle-${openPanels.siftscience ? 'up' : 'down'}`}></i> Sift Science
                    </a>
                  </h3>
                </div>
                {openPanels.siftscience && (
                  <div className="panel-body">
                    <p>
                      <span className="label label-warning">Note</span>{' '}
                      Edit sift_science_to template tag if you wish to receive notifications for held orders
                    </p>
                    <div className="form-group">
                      <label>Enable Sift Science</label>
                      <br />
                      <RadioYesNo
                        name="sift_science"
                        value={options.sift_science || 'n'}
                        onChange={(val) => handleChange('sift_science', val)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sift Science Method</label>
                      <br />
                      <label className="radio-inline">
                        <input type="radio" name="sift_version" value="203"
                          checked={(options.sift_version || '203') === '203'}
                          onChange={() => handleChange('sift_version', '203')} /> Actions
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="sift_version" value="204"
                          checked={options.sift_version === '204'}
                          onChange={() => handleChange('sift_version', '204')} /> Workflows
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Sift Science API Key</label>
                      <input type="text" name="sift_science_apikey" className="form-control"
                        value={options.sift_science_apikey || ''}
                        onChange={(e) => handleChange('sift_science_apikey', e.target.value)} />
                    </div>

                    {/* Actions fields (version 203) */}
                    {(options.sift_version || '203') === '203' && (
                      <div id="sift_actions">
                        <div className="form-group">
                          <label>Sift Science Block ID</label>
                          <input type="text" name="sift_science_blockid" className="form-control"
                            value={options.sift_science_blockid || ''}
                            onChange={(e) => handleChange('sift_science_blockid', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Sift Science Allow ID</label>
                          <input type="text" name="sift_science_allowid" className="form-control"
                            value={options.sift_science_allowid || ''}
                            onChange={(e) => handleChange('sift_science_allowid', e.target.value)} />
                        </div>
                      </div>
                    )}

                    {/* Workflows fields (version 204) */}
                    {options.sift_version === '204' && (
                      <div id="sift_workflows">
                        <div className="form-group">
                          <p className="help-block"><i className="fa fa-info-circle"></i>&nbsp;If the given abuse type is not used, leave the field blank</p>
                        </div>
                        <div className="form-group">
                          <label>Sift Science Payment Abuse Accept ID</label>
                          <input type="text" name="sift_payment_abuse_acceptid" className="form-control"
                            value={options.sift_payment_abuse_acceptid || ''}
                            onChange={(e) => handleChange('sift_payment_abuse_acceptid', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Sift Science Content Abuse Accept ID</label>
                          <input type="text" name="sift_content_abuse_acceptid" className="form-control"
                            value={options.sift_content_abuse_acceptid || ''}
                            onChange={(e) => handleChange('sift_content_abuse_acceptid', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Sift Science Account Abuse Accept ID</label>
                          <input type="text" name="sift_account_abuse_acceptid" className="form-control"
                            value={options.sift_account_abuse_acceptid || ''}
                            onChange={(e) => handleChange('sift_account_abuse_acceptid', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Sift Science Promotion Abuse Accept ID</label>
                          <input type="text" name="sift_promotion_abuse_acceptid" className="form-control"
                            value={options.sift_promotion_abuse_acceptid || ''}
                            onChange={(e) => handleChange('sift_promotion_abuse_acceptid', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
        <br />
        <input type="submit" value="Submit" name="submit" className="btn btn-primary" />
      </form>
    </>
  );
}
