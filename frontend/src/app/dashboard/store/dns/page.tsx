'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export default function StoreDNSPage() {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ type: '', name: '', value: '', ttl: '3600' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/store/dns');
      setRecords(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load DNS records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/store/dns', {
        ...formData,
        ttl: parseInt(formData.ttl),
      });
      setFormData({ type: '', name: '', value: '', ttl: '3600' });
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add DNS record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!window.confirm('Delete this DNS record?')) return;

    try {
      await api.delete(`/store/dns/${recordId}`);
      fetchRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>DNS Settings</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage DNS records for your store domain.
          </p>
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
                  <h3 className="panel-title"><i className="fa fa-plus"></i> Add DNS Record</h3>
                </div>
                <div className="panel-body">
                  <form onSubmit={handleAddRecord}>
                    <div className="form-group">
                      <label>Record Type *</label>
                      <select
                        className="form-control"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select type...</option>
                        <option value="A">A</option>
                        <option value="AAAA">AAAA</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Value *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>TTL</label>
                      <input
                        type="number"
                        className="form-control"
                        name="ttl"
                        value={formData.ttl}
                        onChange={handleInputChange}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Adding...' : 'Add Record'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-list"></i> Current Records</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length > 0 ? (
                        records.map(record => (
                          <tr key={record.id}>
                            <td>{record.type}</td>
                            <td>{record.name}</td>
                            <td><code>{record.value}</code></td>
                            <td>
                              <button
                                className="btn btn-xs btn-danger"
                                onClick={() => handleDelete(record.id)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center">No records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
