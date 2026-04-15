'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * SSL Certificate Application page.
 * Replicates old platform's store_cert.tpl exactly.
 * Panel with: Website, Company, Department, Address 1/2, City, State, Zip, Country, Email.
 * On submit: generates CSR, shows certthanks page with submitted info.
 */

export default function SecurityCertificatesPage() {
  const { siteId } = useStore();

  const [form, setForm] = useState({
    website: '',
    co_name: '',
    dept: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    email: '',
  });
  const [stateOptions, setStateOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyCert, setApplyCert] = useState<any>(null);

  useEffect(() => {
    if (siteId) fetchCertForm();
  }, [siteId]);

  const fetchCertForm = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-domain/cert/${siteId}`);
      const valid = res.data.valid || {};
      setForm({
        website: valid.website || '',
        co_name: valid.co_name || '',
        dept: valid.dept || '',
        address1: valid.address1 || '',
        address2: valid.address2 || '',
        city: valid.city || '',
        state: valid.state || '',
        zip: valid.zip || '',
        country: valid.country || '',
        email: valid.email || '',
      });
      setStateOptions(res.data.state_options || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load certificate form');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await api.post(`/store-domain/cert/${siteId}`, form);
      setApplyCert(res.data.applycert);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit certificate application');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  // Thank you page (matches store_certthanks.tpl)
  if (applyCert) {
    return (
      <>
        <div className="row">
          <div className="col-lg-12">
            <h1>SSL Certificate Application</h1>
            <br />
            <p>
              Thank you. Your application for your SSL Certificate has been submitted. Submitted information:
            </p>
            <br />
            <pre>
{applyCert.csr}

            Address: {applyCert.address1}
                     {applyCert.address2}
            Zip:     {applyCert.zip}
            </pre>
          </div>
        </div>
        <br /><br />
      </>
    );
  }

  // Determine if UK for state/county field
  const isUk = form.country.toUpperCase() === 'GB' || form.country.toUpperCase() === 'UK';

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>SSL Certificate Application</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}

      <form name="store_cert" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> SSL Certificate Application</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="text"
                    name="website"
                    className="form-control"
                    maxLength={255}
                    value={form.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="co_name"
                    className="form-control"
                    maxLength={255}
                    value={form.co_name}
                    onChange={(e) => handleChange('co_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="dept"
                    className="form-control"
                    maxLength={255}
                    value={form.dept}
                    onChange={(e) => handleChange('dept', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Address 1</label>
                  <input
                    type="text"
                    name="address1"
                    className="form-control"
                    maxLength={255}
                    value={form.address1}
                    onChange={(e) => handleChange('address1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Address 2</label>
                  <input
                    type="text"
                    name="address2"
                    className="form-control"
                    maxLength={255}
                    value={form.address2}
                    onChange={(e) => handleChange('address2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    maxLength={255}
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>

                {!isUk ? (
                  <div className="form-group">
                    <label>State/Province</label>
                    <select
                      name="state"
                      className="form-control"
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    >
                      {Object.entries(stateOptions).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>County/State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    name="zip"
                    className="form-control"
                    maxLength={255}
                    value={form.zip}
                    onChange={(e) => handleChange('zip', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Country (2 letter code)</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    style={{ width: '100px', display: 'inline-block' }}
                    value={form.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    size={3}
                    maxLength={2}
                  />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="text"
                    name="email"
                    className="form-control"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <input
              type="submit"
              name="submit"
              value={saving ? 'Submitting...' : 'Submit'}
              className="btn btn-primary"
              disabled={saving}
            />
          </div>
        </div>
      </form>
    </>
  );
}
