'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BlockedItem {
  id: string;
  type: string;
  value: string;
  reason: string;
  created_at: string;
}

export default function StoreBlockListPage() {
  const [items, setItems] = useState<BlockedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ type: '', value: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlockList();
  }, []);

  const fetchBlockList = async () => {
    try {
      const res = await api.get('/store/block-list');
      setItems(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load block list');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/store/block-list', formData);
      setFormData({ type: '', value: '', reason: '' });
      fetchBlockList();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Delete this blocked item?')) return;
    try {
      await api.delete(`/store/block-list/${itemId}`);
      fetchBlockList();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Block List</h1>
          <p><i className="fa fa-info-circle"></i> Manage blocked items.</p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div className="row">
            <div className="col-lg-6">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-plus"></i> Add Blocked Item</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddItem}>
                    <div className="form-group">
                      <label>Type *</label>
                      <select className="form-control" name="type" value={formData.type} onChange={handleInputChange} required>
                        <option value="">Select type...</option>
                        <option value="email">Email</option>
                        <option value="ip">IP Address</option>
                        <option value="domain">Domain</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Value *</label>
                      <input type="text" className="form-control" name="value" value={formData.value} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label>Reason</label>
                      <input type="text" className="form-control" name="reason" value={formData.reason} onChange={handleInputChange} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Item'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-list"></i> Blocked Items</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr><th>Type</th><th>Value</th><th>Reason</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? items.map(item => (
                        <tr key={item.id}>
                          <td>{item.type}</td>
                          <td><code>{item.value}</code></td>
                          <td>{item.reason || '-'}</td>
                          <td>
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(item.id)}>
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center">No items found</td></tr>
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
