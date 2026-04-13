'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormData {
  product_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_percentage: string;
  discount_amount: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
}

export default function ProductDiscountEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discountId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    product_id: '',
    discount_type: 'percentage',
    discount_percentage: '',
    discount_amount: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [productsRes] = await Promise.all([api.get('/products')]);
      setProducts(productsRes.data.data || []);

      if (discountId) {
        const discountRes = await api.get(`/products/discounts/${discountId}`);
        const discount = discountRes.data.data;
        setFormData({
          product_id: discount.product_id,
          discount_type: discount.discount_percentage > 0 ? 'percentage' : 'fixed',
          discount_percentage: discount.discount_percentage || '',
          discount_amount: discount.discount_amount || '',
          start_date: discount.start_date,
          end_date: discount.end_date,
          status: discount.status,
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        product_id: formData.product_id,
        discount_type: formData.discount_type,
        discount_percentage: formData.discount_type === 'percentage' ? parseFloat(formData.discount_percentage) : 0,
        discount_amount: formData.discount_type === 'fixed' ? parseFloat(formData.discount_amount) : 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      };

      if (discountId) {
        await api.put(`/products/discounts/${discountId}`, payload);
      } else {
        await api.post('/products/discounts', payload);
      }
      router.push('/products/discounts');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>{discountId ? 'Edit' : 'Add'} Product Discount</h1>
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Discount Details</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Product *</label>
                  <select
                    className="form-control"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Type *</label>
                  <div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="percentage"
                          checked={formData.discount_type === 'percentage'}
                          onChange={handleInputChange}
                          name="discount_type"
                        />
                        Percentage
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="fixed"
                          checked={formData.discount_type === 'fixed'}
                          onChange={handleInputChange}
                          name="discount_type"
                        />
                        Fixed Amount
                      </label>
                    </div>
                  </div>
                </div>

                {formData.discount_type === 'percentage' && (
                  <div className="form-group">
                    <label>Discount Percentage *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                {formData.discount_type === 'fixed' && (
                  <div className="form-group">
                    <label>Discount Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="discount_amount"
                      value={formData.discount_amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Discount'}
            </button>
            <a href="/products/discounts" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
