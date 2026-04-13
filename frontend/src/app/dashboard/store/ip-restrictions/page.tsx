'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface IPRestriction {
  id: string;
  ip_address: string;
  allow: boolean;
  description: string;
}

export default function StoreIPRestrictionsPage() {
  const [restrictions, setRestrictions] = useState<IPRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ip_address: '', allow: true, description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRestrictions();
  }, []);

  const fetchRestrictions = async () => {
    try {
      const res = await api.get('/store/ip-restrictions');
      setRestrictions(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load IP restrictions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddRestriction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/store/ip-restrictions', formData);
      setFormData({ ip_address: '', allow: true, description: '' });
      fetchRestrictions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add restriction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this IP restriction?')) return;
    try {
      await api.delete(`/store/ip-restrictions/${id}`);
      fetchRestrictions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete restriction');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>IP Restrictions</h1>
          <p><i className="fa fa-info-circle"></i> Manage IP address restrictions.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <>
          <div className="row">
            <div className="col-lg-6">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-plus"></i> Add IP Restriction</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddRestriction}>
                    <div className="form-group">
                      <label>IP Address *</label>
                      <input type="text" className="form-control" name="ip_address" value={formData.ip_address} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>
                        <input type="checkbox" name="allow" checked={formData.allow} onChange={handleInputChange} />
                        Allow (uncheck to deny)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <input type="text" className="form-control" name="description" value={formData.description} onChange={handleInputChange} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Restriction'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-list"></i> IP Restrictions</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr><th>IP Address</th><th>Type</th><th>Description</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {restrictions.length > 0 ? restrictions.map(r => (
                        <tr key={r.id}>
                          <td><code>{r.ip_address}</code></td>
                          <td><span className={`label label-${r.allow ? 'success' : 'danger'}`}>{r.allow ? 'Allow' : 'Deny'}</span></td>
                          <td>{r.description || '-'}</td>
                          <td>
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(r.id)}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center">No restrictions found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
