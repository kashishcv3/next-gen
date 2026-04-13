'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  sku: string;
  price: string;
  cost: string;
  vendor_id: string;
  category_ids: string[];
  description: string;
  short_description: string;
}

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

export default function ProductAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    price: '',
    cost: '',
    vendor_id: '',
    category_ids: [],
    description: '',
    short_description: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, vendorsRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/vendors'),
      ]);
      setCategories(categoriesRes.data.data || []);
      setVendors(vendorsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load form data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      category_ids: selected,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        vendor_id: formData.vendor_id,
        category_ids: formData.category_ids,
        description: formData.description,
        short_description: formData.short_description,
      };

      await api.post('/products', payload);
      router.push('/products/list');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Product</h1>
          <p>
            <i className="fa fa-info-circle"></i> Enter product information below.
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-product-hunt"></i> Product Information
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Vendor</label>
                  <select
                    className="form-control"
                    name="vendor_id"
                    value={formData.vendor_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a vendor...</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Categories</label>
                  <select
                    multiple
                    className="form-control"
                    name="category_ids"
                    value={formData.category_ids}
                    onChange={handleCategoryChange}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <textarea
                    className="form-control"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <a href="/products/list" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
