'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TaxAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', type: 'state', rate: '', region: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/tax/tables', { ...formData, rate: parseFloat(formData.rate) });
      router.push('/tax/list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tax table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Tax Table</h1>
          <p><i className="fa fa-info-circle"></i> Create a new tax table.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-plus"></i> Tax Table Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Table Name *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select className="form-control" name="type" value={formData.type} onChange={handleInputChange} required>
                    <option value="state">State</option>
                    <option value="local">Local</option>
                    <option value="country">Country</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Region *</label>
                  <input type="text" className="form-control" name="region" value={formData.region} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Tax Rate (%) *</label>
                  <input type="number" className="form-control" name="rate" value={formData.rate} onChange={handleInputChange} step="0.01" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tax Table'}
            </button>
            <a href="/tax/list" className="btn btn-default">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
