'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface FormData {
  percentage: string;
  type: 'increase' | 'decrease';
  apply_to: 'all' | 'category';
  category_id: string;
}

export default function ProductGlobalPriceChangePage() {
  const [formData, setFormData] = useState<FormData>({
    percentage: '',
    type: 'increase',
    apply_to: 'all',
    category_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/products/global-price-change', {
        percentage: parseFloat(formData.percentage),
        type: formData.type,
        apply_to: formData.apply_to,
        category_id: formData.apply_to === 'category' ? formData.category_id : null,
      });

      setSuccess(`Prices updated successfully. ${response.data.message}`);
      setFormData({
        percentage: '',
        type: 'increase',
        apply_to: 'all',
        category_id: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Global Price Change</h1>
          <p><i className="fa fa-dollar"></i> Apply percentage changes to all product prices.</p>
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

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Price Change Settings</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action will update prices for all selected products.
                </div>

                <div className="form-group">
                  <label>Apply To</label>
                  <div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="all"
                          checked={formData.apply_to === 'all'}
                          onChange={handleInputChange}
                          name="apply_to"
                        />
                        All Products
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="category"
                          checked={formData.apply_to === 'category'}
                          onChange={handleInputChange}
                          name="apply_to"
                        />
                        Specific Category
                      </label>
                    </div>
                  </div>
                </div>

                {formData.apply_to === 'category' && (
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      placeholder="Enter category ID"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Change Type</label>
                  <div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="increase"
                          checked={formData.type === 'increase'}
                          onChange={handleInputChange}
                          name="type"
                        />
                        Increase
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="decrease"
                          checked={formData.type === 'decrease'}
                          onChange={handleInputChange}
                          name="type"
                        />
                        Decrease
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Percentage *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Apply Price Change'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
