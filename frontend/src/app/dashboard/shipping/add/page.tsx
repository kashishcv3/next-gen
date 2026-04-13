'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ShippingAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', carrier: '', rate_type: 'weight', base_rate: '' });
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
      await api.post('/shipping/tables', { ...formData, base_rate: parseFloat(formData.base_rate) });
      router.push('/shipping/list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create shipping table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Shipping Table</h1>
          <p><i className="fa fa-info-circle"></i> Create a new shipping table.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-plus"></i> Shipping Table Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Table Name *</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Carrier *</label>
                  <select className="form-control" name="carrier" value={formData.carrier} onChange={handleInputChange} required>
                    <option value="">Select carrier...</option>
                    <option value="ups">UPS</option>
                    <option value="fedex">FedEx</option>
                    <option value="usps">USPS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rate Type *</label>
                  <select className="form-control" name="rate_type" value={formData.rate_type} onChange={handleInputChange} required>
                    <option value="weight">Weight Based</option>
                    <option value="price">Price Based</option>
                    <option value="quantity">Quantity Based</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Base Rate *</label>
                  <input type="number" className="form-control" name="base_rate" value={formData.base_rate} onChange={handleInputChange} step="0.01" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Shipping Table'}
            </button>
            <a href="/shipping/list" className="btn btn-default">Cancel</a>
          </div>
        </div>
      </form>
    </div>
  );
}
