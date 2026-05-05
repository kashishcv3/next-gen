'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const VALUTEC_PROGRAMS: Record<string, string> = {
  '': '-- Select --',
  '39d0b498-5e78-4940-be94-ad538fa42678': 'Valutec Standard',
  'e3234dbe-b129-461b-8e3b-89cdfc1a2a0a': 'Valutec Loyalty',
  'aa03da87-2e27-43b5-82f9-e98a0d51f816': 'Valutec Combo',
  '8eef3dcd-1489-4081-bfe8-46ed5252a18a': 'Valutec eGift',
  'b88fad36-9be4-4a13-84d9-6b25c1ca476c': 'Valutec Promo',
};

export default function ValutecGiftCardServicePage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/orders/gift-card-service/valutec');
      setData(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => setData({ ...data, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      await api.post('/orders/gift-card-service/valutec', data);
      setSuccess('Valutec settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const RadioYN = ({ name, label }: { name: string; label: string }) => (
    <div className="form-group">
      <label>{label}</label>
      <div>
        <div className="btn-group" data-toggle="buttons">
          <label className={`btn btn-primary ${data[name] === 'y' ? 'active' : ''}`} onClick={() => handleChange(name, 'y')}>
            <input type="radio" checked={data[name] === 'y'} onChange={() => {}} /> Yes
          </label>
          <label className={`btn btn-primary ${data[name] !== 'y' ? 'active' : ''}`} onClick={() => handleChange(name, 'n')}>
            <input type="radio" checked={data[name] !== 'y'} onChange={() => {}} /> No
          </label>
        </div>
      </div>
    </div>
  );

  const version = data.gcv_version || 'legacy';
  const createEnabled = data.gcv_create === 'y';

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12"><h1>Valutec</h1></div></div>
      <br /><br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3></div>
            <div className="panel-body">
              <div className="form-group">
                <label>Valutec Version</label>
                <div>
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${version === 'legacy' ? 'active' : ''}`} onClick={() => handleChange('gcv_version', 'legacy')}>
                      <input type="radio" checked={version === 'legacy'} onChange={() => {}} /> Legacy
                    </label>
                    <label className={`btn btn-primary ${version === 'current' ? 'active' : ''}`} onClick={() => handleChange('gcv_version', 'current')}>
                      <input type="radio" checked={version === 'current'} onChange={() => {}} /> Current
                    </label>
                  </div>
                </div>
              </div>
              {version === 'current' && (
                <p><i className="fa fa-info-circle"></i>&nbsp;Note: Your Terminal ID must be set up as PIN-required to use this version. PIN will be required for both balance check and redemption.</p>
              )}
              <RadioYN name="gcv_processor" label="Process Gift Certificates" />
              {version === 'current' && (
                <>
                  <RadioYN name="gcv_create" label="Create Gift Certificates" />
                  {createEnabled && (
                    <>
                      <div className="form-group">
                        <label>Card Program</label>
                        <select className="form-control" value={data.gcv_program || ''} onChange={(e) => handleChange('gcv_program', e.target.value)}>
                          {Object.entries(VALUTEC_PROGRAMS).map(([val, lbl]) => (
                            <option key={val} value={val}>{lbl}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Card Creation Terminal ID</label>
                        <input type="text" className="form-control" value={data.gcv_terminal_create || ''} onChange={(e) => handleChange('gcv_terminal_create', e.target.value)} />
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="form-group">
                <label>Terminal ID</label>
                <input type="text" className="form-control" value={data.gcv_terminal || ''} onChange={(e) => handleChange('gcv_terminal', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Server ID (Cashier ID)</label>
                <input type="text" className="form-control" value={data.gcv_server || ''} onChange={(e) => handleChange('gcv_server', e.target.value)} />
              </div>
              {version === 'current' && (
                <div className="form-group">
                  <label>Client Key</label>
                  <input type="text" className="form-control" value={data.gcv_clientkey || ''} onChange={(e) => handleChange('gcv_clientkey', e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div></div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving...</> : 'Submit'}
        </button>
      </form>
    </div>
  );
}
