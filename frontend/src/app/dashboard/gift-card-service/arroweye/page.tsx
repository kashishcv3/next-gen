'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ArroweyeGiftCardServicePage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/orders/gift-card-service/arroweye');
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
      await api.post('/orders/gift-card-service/arroweye', data);
      setSuccess('ArrowEye settings saved successfully');
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

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12"><h1>ArrowEye</h1></div></div>
      <br /><br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3></div>
            <div className="panel-body">
              <RadioYN name="arroweye_gift_certificates" label="Create Gift Certificates" />
              <div className="form-group">
                <label>Gift Card Product ID</label>
                <input type="text" className="form-control" value={data.arroweye_gift_card || ''} onChange={(e) => handleChange('arroweye_gift_card', e.target.value)} style={{width:'200px'}} />
              </div>
              <div className="form-group">
                <label>Greeting Card Product ID</label>
                <input type="text" className="form-control" value={data.arroweye_greet_card || ''} onChange={(e) => handleChange('arroweye_greet_card', e.target.value)} style={{width:'200px'}} />
              </div>
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
