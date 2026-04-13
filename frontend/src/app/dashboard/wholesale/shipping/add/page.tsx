'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WholesaleShippingAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    carrier: '',
    tracking_number: '',
    status: 'in_transit',
    wholesale_id: '',
    order_id: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/wholesale/shipping', formData);
      router.push('/wholesale/shipping/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create shipping record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add Shipping Record</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Shipping Information</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="carrier">Carrier *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="carrier"
                    name="carrier"
                    value={formData.carrier}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tracking_number">Tracking Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tracking_number"
                    name="tracking_number"
                    value={formData.tracking_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Pending</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="wholesale_id">Wholesale ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="wholesale_id"
                    name="wholesale_id"
                    value={formData.wholesale_id}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="order_id">Order ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="order_id"
                    name="order_id"
                    value={formData.order_id}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <i className="fa fa-save"></i> {loading ? 'Saving...' : 'Create Shipping Record'}
            </button>
            <Link href="/wholesale/shipping/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
              Cancel
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
