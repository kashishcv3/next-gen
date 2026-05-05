'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function CreateGiftCertificatesPage() {
  const [value, setValue] = useState('');
  const [daysAvailable, setDaysAvailable] = useState('0');
  const [oneTimeUse, setOneTimeUse] = useState('n');
  const [qty, setQty] = useState('');
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ created: number; codes: string[]; nocodes: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setResult(null);

    if (!value || !qty) {
      setError('Please fill in Value and Quantity fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('value', value);
      formData.append('days_available', daysAvailable);
      formData.append('one_time_use', oneTimeUse);
      formData.append('qty', qty);
      formData.append('history', history);

      const res = await api.post('/orders/gc-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create gift certificates');
    } finally {
      setLoading(false);
    }
  };

  const downloadCodes = () => {
    if (!result?.codes?.length) return;
    const csv = result.codes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gift_certificate_codes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Create Gift Certificates</h1>
        <p>Create gift certificates in bulk for promotions.</p>
      </div></div>
      <br />
      <p>
        <a className="btn btn-primary btn-sm" href="/dashboard/reports/gift-cards">Gift Certificate Tracking</a>
        {' '}
        <a className="btn btn-primary btn-sm" href="#" onClick={(e) => e.preventDefault()}>Gift Certificate Batch History</a>
      </p>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}

      {result && (
        <div>
          <span className="label label-success">Your gift certificates have been created.</span>
          {' '}
          <a href="#" onClick={(e) => { e.preventDefault(); downloadCodes(); }}>Download Codes</a>
          <br />
          <span className="label label-warning">Note</span> You can download previous batches on the Gift Certificate Batch History page.
          {result.nocodes && result.nocodes.length > 0 && (
            <div style={{marginTop:'10px'}}>
              <span className="label label-warning">Note</span> Some of your codes were invalid or were already in the system ({result.nocodes.length} codes).
            </div>
          )}
          <br /><br />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-cogs"></i> Create Gift Certificates</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label>Value:</label>
                <input type="text" className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Days Available:</label>
                <input type="text" className="form-control" value={daysAvailable} onChange={(e) => setDaysAvailable(e.target.value)} />
                <p className="help-block">(0 for unlimited)</p>
              </div>
              <div className="form-group">
                <label>Will these codes be one-time use only?</label>
                <div>
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${oneTimeUse === 'y' ? 'active' : ''}`} onClick={() => setOneTimeUse('y')}>
                      <input type="radio" checked={oneTimeUse === 'y'} onChange={() => {}} /> Yes
                    </label>
                    <label className={`btn btn-primary ${oneTimeUse !== 'y' ? 'active' : ''}`} onClick={() => setOneTimeUse('n')}>
                      <input type="radio" checked={oneTimeUse !== 'y'} onChange={() => {}} /> No
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Quantity Needed:</label>
                <input type="text" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Log Note:</label>
                <textarea className="form-control" rows={5} value={history} onChange={(e) => setHistory(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><i className="fa fa-spinner fa-spin"></i> Creating...</> : 'Create Gift Certificates'}
          </button>
        </div></div>
      </form>
    </div>
  );
}
