'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SuggestedSearch {
  id: string;
  term: string;
  clicks: number;
  is_active: boolean;
}

export default function StoreSuggestedSearchPage() {
  const [items, setItems] = useState<SuggestedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ term: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/store/suggested-search');
      setItems(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load suggested searches');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/store/suggested-search', formData);
      setFormData({ term: '' });
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add search term');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this search term?')) return;
    try {
      await api.delete(`/store/suggested-search/${id}`);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Suggested Search Terms</h1>
          <p><i className="fa fa-info-circle"></i> Manage suggested search terms for your store.</p>
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
                  <h3 className="panel-title"><i className="fa fa-plus"></i> Add Search Term</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddItem}>
                    <div className="form-group">
                      <label>Search Term *</label>
                      <input type="text" className="form-control" value={formData.term} onChange={(e) => setFormData({term: e.target.value})} required />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Term'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-list"></i> Search Terms</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr><th>Term</th><th>Clicks</th><th>Active</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                          <td>{item.term}</td>
                          <td>{item.clicks}</td>
                          <td><span className={`label label-${item.is_active ? 'success' : 'default'}`}>{item.is_active ? 'Yes' : 'No'}</span></td>
                          <td>
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(item.id)}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center">No search terms found</td></tr>
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
