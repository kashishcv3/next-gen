'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface ShippingData {
  id: string;
  name: string;
  carrier: string;
  tracking_number: string;
  status: string;
  wholesale_id: string;
  order_id: string;
}

export default function WholesaleShippingEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ShippingData>({
    id: '',
    name: '',
    carrier: '',
    tracking_number: '',
    status: 'in_transit',
    wholesale_id: '',
    order_id: '',
  });

  useEffect(() => {
    fetchShipping();
  }, [id]);

  const fetchShipping = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wholesale/shipping/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load shipping record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/wholesale/shipping/${id}`, formData);
      router.push('/wholesale/shipping/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update shipping record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Shipping Record</h1>

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

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
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
