'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface FormData {
  promo_name: string;
  description: string;
  promo_type: string;
  promo_level: string;
  trigger: string;
  trigger_type: string;
  event: string;
  event_type: string;
  active: number;
}

export default function PromoEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    promo_name: '',
    description: '',
    promo_type: '',
    promo_level: '',
    trigger: '',
    trigger_type: '',
    event: '',
    event_type: '',
    active: 1,
  });

  useEffect(() => {
    fetchPromo();
  }, [id]);

  const fetchPromo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/marketing/promos/${id}`);
      setFormData({
        promo_name: response.data.promo_name,
        description: response.data.description || '',
        promo_type: response.data.promo_type,
        promo_level: response.data.promo_level,
        trigger: response.data.trigger || '',
        trigger_type: response.data.trigger_type || '',
        event: response.data.event || '',
        event_type: response.data.event_type || '',
        active: response.data.active,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch promo:', err);
      setError('Failed to load promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.put(`/marketing/promos/${id}`, formData);
      router.push('/dashboard/promos/list');
    } catch (err) {
      console.error('Failed to update promo:', err);
      setError('Failed to update promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Promotion</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="promo_name">Promotion Name</label>
              <input
                type="text"
                className="form-control"
                id="promo_name"
                name="promo_name"
                value={formData.promo_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="promo_type">Promotion Type</label>
              <select
                className="form-control"
                id="promo_type"
                name="promo_type"
                value={formData.promo_type}
                onChange={handleChange}
              >
                <option value="discount">Discount</option>
                <option value="free_gift">Free Gift</option>
                <option value="bogo">Buy One Get One</option>
                <option value="percentage">Percentage Off</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="promo_level">Promo Level</label>
              <select
                className="form-control"
                id="promo_level"
                name="promo_level"
                value={formData.promo_level}
                onChange={handleChange}
              >
                <option value="product">Product</option>
                <option value="category">Category</option>
                <option value="cart">Cart</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="trigger">Trigger</label>
              <input
                type="text"
                className="form-control"
                id="trigger"
                name="trigger"
                value={formData.trigger}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="trigger_type">Trigger Type</label>
              <input
                type="text"
                className="form-control"
                id="trigger_type"
                name="trigger_type"
                value={formData.trigger_type}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="active">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active === 1}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                  style={{ marginRight: '10px' }}
                />
                Active
              </label>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <i className="fa fa-save"></i> Save Changes
              </button>
              <a href="/dashboard/promos/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                Cancel
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
