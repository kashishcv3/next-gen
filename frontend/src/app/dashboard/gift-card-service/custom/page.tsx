'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CustomGiftCardServicePage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/orders/gift-card-service/custom');
      setData(res.data.data || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      await api.post('/orders/gift-card-service/custom', data);
      setSuccess('Custom Gift Card Service saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Conditional visibility
  const apiVersion = data.giftcertws_apiversion || '1';
  const secureEnabled = data.giftcertws_secure || 'n';

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Custom Gift Card Service</h1>
      </div></div>
      <br /><br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label>Enable API</label>
                <div>
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${data.giftcertws_api === 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_api', 'y')}>
                      <input type="radio" name="giftcertws_api" value="y" checked={data.giftcertws_api === 'y'} onChange={() => handleChange('giftcertws_api', 'y')} /> Yes
                    </label>
                    <label className={`btn btn-primary ${data.giftcertws_api !== 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_api', 'n')}>
                      <input type="radio" name="giftcertws_api" value="n" checked={data.giftcertws_api !== 'y'} onChange={() => handleChange('giftcertws_api', 'n')} /> No
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>API Version</label>
                <div>
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${apiVersion === '1' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_apiversion', '1')}>
                      <input type="radio" name="giftcertws_apiversion" value="1" checked={apiVersion === '1'} onChange={() => handleChange('giftcertws_apiversion', '1')} /> v1
                    </label>
                    <label className={`btn btn-primary ${apiVersion === '2' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_apiversion', '2')}>
                      <input type="radio" name="giftcertws_apiversion" value="2" checked={apiVersion === '2'} onChange={() => handleChange('giftcertws_apiversion', '2')} /> v2
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>URL</label>
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <span>https://</span>
                  <input type="text" className="form-control" style={{display:'inline-block'}} name="giftcertws_url" value={data.giftcertws_url || ''} onChange={(e) => handleChange('giftcertws_url', e.target.value)} />
                </div>
              </div>

              {apiVersion === '2' && (
                <>
                  <div className="form-group">
                    <label>Enable Authentication</label>
                    <div>
                      <div className="btn-group" data-toggle="buttons">
                        <label className={`btn btn-primary ${secureEnabled === 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_secure', 'y')}>
                          <input type="radio" name="giftcertws_secure" value="y" checked={secureEnabled === 'y'} onChange={() => handleChange('giftcertws_secure', 'y')} /> Yes
                        </label>
                        <label className={`btn btn-primary ${secureEnabled !== 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_secure', 'n')}>
                          <input type="radio" name="giftcertws_secure" value="n" checked={secureEnabled !== 'y'} onChange={() => handleChange('giftcertws_secure', 'n')} /> No
                        </label>
                      </div>
                    </div>
                  </div>
                  {secureEnabled === 'y' && (
                    <>
                      <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-control" value={data.giftcertws_username || ''} onChange={(e) => handleChange('giftcertws_username', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" value={data.giftcertws_password || ''} onChange={(e) => handleChange('giftcertws_password', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Signing Key</label>
                        <input type="text" className="form-control" value={data.giftcertws_signkey || ''} onChange={(e) => handleChange('giftcertws_signkey', e.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label>Require PIN Number</label>
                    <div>
                      <div className="btn-group" data-toggle="buttons">
                        <label className={`btn btn-primary ${data.giftcertws_require_pin === 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_require_pin', 'y')}>
                          <input type="radio" name="giftcertws_require_pin" value="y" checked={data.giftcertws_require_pin === 'y'} onChange={() => handleChange('giftcertws_require_pin', 'y')} /> Yes
                        </label>
                        <label className={`btn btn-primary ${data.giftcertws_require_pin !== 'y' ? 'active' : ''}`} onClick={() => handleChange('giftcertws_require_pin', 'n')}>
                          <input type="radio" name="giftcertws_require_pin" value="n" checked={data.giftcertws_require_pin !== 'y'} onChange={() => handleChange('giftcertws_require_pin', 'n')} /> No
                        </label>
                      </div>
                    </div>
                  </div>
                </>
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
