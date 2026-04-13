'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface URIRedirect {
  id: string;
  old_uri: string;
  new_uri: string;
  status_code: number;
  created_at: string;
}

export default function StoreURIRedirectsPage() {
  const [redirects, setRedirects] = useState<URIRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ old_uri: '', new_uri: '', status_code: '301' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const res = await api.get('/store/uri-redirects');
      setRedirects(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load redirects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRedirect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/store/uri-redirects', { ...formData, status_code: parseInt(formData.status_code) });
      setFormData({ old_uri: '', new_uri: '', status_code: '301' });
      fetchRedirects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add redirect');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this redirect?')) return;
    try {
      await api.delete(`/store/uri-redirects/${id}`);
      fetchRedirects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete redirect');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>URI Redirects</h1>
          <p><i className="fa fa-info-circle"></i> Manage URI redirects.</p>
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
                  <h3 className="panel-title"><i className="fa fa-plus"></i> Add Redirect</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddRedirect}>
                    <div className="form-group">
                      <label>Old URI *</label>
                      <input type="text" className="form-control" name="old_uri" value={formData.old_uri} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>New URI *</label>
                      <input type="text" className="form-control" name="new_uri" value={formData.new_uri} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>HTTP Status Code</label>
                      <select className="form-control" name="status_code" value={formData.status_code} onChange={(e) => setFormData(prev => ({ ...prev, status_code: e.target.value }))}>
                        <option value="301">301 (Moved Permanently)</option>
                        <option value="302">302 (Found)</option>
                        <option value="307">307 (Temporary Redirect)</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Redirect'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-list"></i> Redirects</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr><th>Old URI</th><th>New URI</th><th>Code</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {redirects.length > 0 ? redirects.map(r => (
                        <tr key={r.id}>
                          <td><code>{r.old_uri}</code></td>
                          <td><code>{r.new_uri}</code></td>
                          <td>{r.status_code}</td>
                          <td>
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(r.id)}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center">No redirects found</td></tr>
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
