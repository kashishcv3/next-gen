'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ShippingGroupAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/shipping/groups', formData);
      router.push('/shipping/groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Shipping Group</h1>
          <p><i className="fa fa-info-circle"></i> Create a new shipping group.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-plus"></i> Group Information</h3>
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
            <a href="/shipping/groups" className="btn btn-default">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
