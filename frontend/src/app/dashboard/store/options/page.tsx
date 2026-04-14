'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StoreOptionsPage() {
  const [options, setOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/settings/store-options');
      const optionMap: Record<string, string> = {};
      (res.data.data || []).forEach((opt: any) => {
        optionMap[opt.option_key] = opt.option_value;
      });
      setOptions(optionMap);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load store options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    try {
      for (const [key, value] of Object.entries(options)) {
        await api.post('/settings/store-options', {
          option_key: key,
          option_value: value,
          category: 'general',
        });
      }
      setSuccess('Store options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save options');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Options</h1>
          <p><i className="fa fa-info-circle"></i> Configure core store settings.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-cog"></i> Store Configuration</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Store Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={options['store_name'] || ''}
                      onChange={(e) => handleChange('store_name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Store URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={options['store_url'] || ''}
                      onChange={(e) => handleChange('store_url', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Support Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={options['support_email'] || ''}
                      onChange={(e) => handleChange('support_email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Support Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={options['support_phone'] || ''}
                      onChange={(e) => handleChange('support_phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <button type="submit" className="btn btn-primary"><i className="fa fa-save"></i> Save Options</button>
            </div>
          </div>
        </form>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
