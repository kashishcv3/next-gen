'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DisplayOptions {
  items_per_page: number;
  enable_quick_view: boolean;
  enable_wishlist: boolean;
  show_related_products: boolean;
  show_customer_reviews: boolean;
  enable_product_zoom: boolean;
  default_product_image_size: string;
  enable_guest_checkout: boolean;
}

export default function SettingsDisplayPage() {
  const [options, setOptions] = useState<DisplayOptions>({
    items_per_page: 12,
    enable_quick_view: true,
    enable_wishlist: true,
    show_related_products: true,
    show_customer_reviews: true,
    enable_product_zoom: true,
    default_product_image_size: 'medium',
    enable_guest_checkout: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/settings/display');
      setOptions(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/settings/display', options);
      alert('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Display Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure product and storefront display options.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-eye"></i> Search Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Items Per Page</label>
                  <input type="number" className="form-control" name="items_per_page" value={options.items_per_page} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="enable_quick_view" checked={options.enable_quick_view} onChange={handleInputChange} /> Enable Quick View</label>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-shopping-bag"></i> Checkout Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label><input type="checkbox" name="enable_guest_checkout" checked={options.enable_guest_checkout} onChange={handleInputChange} /> Enable Guest Checkout</label>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Core Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label><input type="checkbox" name="enable_wishlist" checked={options.enable_wishlist} onChange={handleInputChange} /> Enable Wishlist</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="show_customer_reviews" checked={options.show_customer_reviews} onChange={handleInputChange} /> Show Customer Reviews</label>
                </div>

                <div className="form-group">
                  <label>Default Product Image Size</label>
                  <select className="form-control" name="default_product_image_size" value={options.default_product_image_size} onChange={handleInputChange}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="enable_product_zoom" checked={options.enable_product_zoom} onChange={handleInputChange} /> Enable Product Image Zoom</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="show_related_products" checked={options.show_related_products} onChange={handleInputChange} /> Show Related Products</label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
