'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

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

export default function PromoAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    promo_name: '',
    description: '',
    promo_type: 'discount',
    promo_level: 'product',
    trigger: '',
    trigger_type: '',
    event: '',
    event_type: '',
    active: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/marketing/promos', formData);
      router.push('/dashboard/promos/list');
    } catch (err) {
      console.error('Failed to create promo:', err);
      setError('Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add Promotion</h1>

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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="fa fa-save"></i> Create Promotion
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
