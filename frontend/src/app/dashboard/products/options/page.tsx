'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ProductOptions {
  display_related_products: boolean;
  display_reviews: boolean;
  display_ratings: boolean;
  display_qanda: boolean;
  allow_pre_order: boolean;
  show_stock_status: boolean;
  require_login_for_purchase: boolean;
}

export default function ProductOptionsPage() {
  const [options, setOptions] = useState<ProductOptions>({
    display_related_products: true,
    display_reviews: true,
    display_ratings: true,
    display_qanda: true,
    allow_pre_order: false,
    show_stock_status: true,
    require_login_for_purchase: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/options');
      setOptions(response.data.data || options);
    } catch (err) {
      console.error('Failed to fetch options:', err);
      setError('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/products/options', options);
      setSuccess('Product options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save options');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Display Options</h1>
          <p>
            <i className="fa fa-sliders"></i> Configure how products are displayed.
          </p>
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
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Display Options</h3>
              </div>
              <div className="panel-body">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="display_related_products"
                      checked={options.display_related_products}
                      onChange={handleChange}
                    />
                    Display related products
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="display_reviews"
                      checked={options.display_reviews}
                      onChange={handleChange}
                    />
                    Display product reviews
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="display_ratings"
                      checked={options.display_ratings}
                      onChange={handleChange}
                    />
                    Display ratings
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="display_qanda"
                      checked={options.display_qanda}
                      onChange={handleChange}
                    />
                    Display Q&A section
                  </label>
                </div>

                <hr />

                <h4>Availability Options</h4>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="allow_pre_order"
                      checked={options.allow_pre_order}
                      onChange={handleChange}
                    />
                    Allow pre-orders
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="show_stock_status"
                      checked={options.show_stock_status}
                      onChange={handleChange}
                    />
                    Show stock status
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="require_login_for_purchase"
                      checked={options.require_login_for_purchase}
                      onChange={handleChange}
                    />
                    Require login for purchase
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Options'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
