'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function GiftCertificateOptionsPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/orders/options/gift');
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
      await api.post('/orders/options/gift', data);
      setSuccess('Gift Certificate Options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const RadioYN = ({ name, label, helpText }: { name: string; label: string; helpText?: string }) => (
    <div className="form-group">
      <label>{label}</label>
      {helpText && <p className="help-block">{helpText}</p>}
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

  const intExtEnabled = data.gift_certificate_internal_external === 'y';

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Gift Certificate Options</h1>
      </div></div>
      <br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading"><h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3></div>
            <div className="panel-body">
              <RadioYN
                name="gift_certificate_delay"
                label="Delay Sending of Codes"
                helpText="If you choose to do this, the code emails will collect in Orders->Gift Certificate Emails and will have to be manually sent or deleted once the order has been verified."
              />
              <div className="form-group">
                <label>Service Fee</label>
                <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                  <input type="text" className="form-control" style={{width:'100px', display:'inline-block'}} value={data.gift_certificate_fee_amount || ''} onChange={(e) => handleChange('gift_certificate_fee_amount', e.target.value)} />
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${data.gift_certificate_fee_type === '%' ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_fee_type', '%')}>
                      <input type="radio" checked={data.gift_certificate_fee_type === '%'} onChange={() => {}} /> Percentage Annually
                    </label>
                    <label className={`btn btn-primary ${data.gift_certificate_fee_type === '$' ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_fee_type', '$')}>
                      <input type="radio" checked={data.gift_certificate_fee_type === '$'} onChange={() => {}} /> Flat Amount Annually
                    </label>
                  </div>
                </div>
              </div>
              <RadioYN name="gift_certificate_applyshipping" label="Can Apply to Shipping" />
              <RadioYN name="gift_certificate_applytax" label="Can Apply to Tax" />
              <div className="form-group">
                <label>Can Apply to Customer Group Rules (Promos)</label>
                <div><span className="label label-warning">Note</span> If you set this to &apos;No&apos; you should NOT exclude gift certificate products at the Rule level since this setting will handle it.</div>
                <div>
                  <div className="btn-group" data-toggle="buttons" style={{marginTop:'5px'}}>
                    <label className={`btn btn-primary ${data.gift_certificate_applypromos === 'y' ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_applypromos', 'y')}>
                      <input type="radio" checked={data.gift_certificate_applypromos === 'y'} onChange={() => {}} /> Yes
                    </label>
                    <label className={`btn btn-primary ${data.gift_certificate_applypromos !== 'y' ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_applypromos', 'n')}>
                      <input type="radio" checked={data.gift_certificate_applypromos !== 'y'} onChange={() => {}} /> No
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Use Internal and 3rd Party Service Together</label>
                <div>
                  <div className="btn-group" data-toggle="buttons">
                    <label className={`btn btn-primary ${intExtEnabled ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_internal_external', 'y')}>
                      <input type="radio" checked={intExtEnabled} onChange={() => {}} /> Yes
                    </label>
                    <label className={`btn btn-primary ${!intExtEnabled ? 'active' : ''}`} onClick={() => handleChange('gift_certificate_internal_external', 'n')}>
                      <input type="radio" checked={!intExtEnabled} onChange={() => {}} /> No
                    </label>
                  </div>
                </div>
              </div>
              {intExtEnabled && (
                <>
                  <div className="form-group">
                    <label>Internal Gift Certificate Display Name</label>
                    <input type="text" className="form-control" style={{width:'400px'}} maxLength={40} value={data.gift_certificate_internal_name || ''} onChange={(e) => handleChange('gift_certificate_internal_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>3rd Party Gift Certificate Display Name</label>
                    <input type="text" className="form-control" style={{width:'400px'}} maxLength={40} value={data.gift_certificate_external_name || ''} onChange={(e) => handleChange('gift_certificate_external_name', e.target.value)} />
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
