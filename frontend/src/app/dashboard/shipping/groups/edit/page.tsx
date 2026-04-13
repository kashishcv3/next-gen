'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShippingGroupEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('id');

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/shipping/groups/${groupId}`);
      const data = res.data.data;
      setFormData({ name: data.name, description: data.description });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put(`/shipping/groups/${groupId}`, formData);
      router.push('/shipping/groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update group');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Edit Shipping Group</h1>
          <p><i className="fa fa-info-circle"></i> Modify shipping group.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-edit"></i> Group Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Group Name *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <a href="/shipping/groups" className="btn btn-default">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
