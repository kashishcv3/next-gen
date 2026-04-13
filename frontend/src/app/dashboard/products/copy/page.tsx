'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormData {
  source_product_id: string;
  new_name: string;
  new_sku: string;
  copy_images: boolean;
  copy_categories: boolean;
  copy_prices: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function ProductCopyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceProductId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    source_product_id: sourceProductId || '',
    new_name: '',
    new_sku: '',
    copy_images: true,
    copy_categories: true,
    copy_prices: true,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceProduct, setSourceProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.source_product_id && sourceProduct?.id !== formData.source_product_id) {
      const product = products.find(p => p.id === formData.source_product_id);
      if (product) {
        setSourceProduct(product);
        setFormData(prev => ({
          ...prev,
          new_name: `${product.name} (Copy)`,
          new_sku: `${product.sku}-COPY`,
        }));
      }
    }
  }, [formData.source_product_id, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCopying(true);
    setError(null);

    try {
      const payload = {
        source_product_id: formData.source_product_id,
        new_name: formData.new_name,
        new_sku: formData.new_sku,
        copy_images: formData.copy_images,
        copy_categories: formData.copy_categories,
        copy_prices: formData.copy_prices,
      };

      await api.post('/products/copy', payload);
      router.push('/products/list');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to copy product');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Copy Product</h1>
          <p>
            <i className="fa fa-copy"></i> Create a duplicate of an existing product.
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

      {loading ? (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading products...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">Copy Product Settings</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Source Product *</label>
                    <select
                      className="form-control"
                      name="source_product_id"
                      value={formData.source_product_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a product to copy...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <hr />

                  <div className="form-group">
                    <label>New Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="new_name"
                      value={formData.new_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>New SKU *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="new_sku"
                      value={formData.new_sku}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <hr />

                  <h4>Copy Options</h4>

                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="copy_images"
                        checked={formData.copy_images}
                        onChange={handleInputChange}
                      />
                      Copy product images
                    </label>
                  </div>

                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="copy_categories"
                        checked={formData.copy_categories}
                        onChange={handleInputChange}
                      />
                      Copy category assignments
                    </label>
                  </div>

                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="copy_prices"
                        checked={formData.copy_prices}
                        onChange={handleInputChange}
                      />
                      Copy pricing information
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={copying}
              >
                {copying ? 'Copying...' : 'Copy Product'}
              </button>
              <a href="/products/list" className="btn btn-default">
                Cancel
              </a>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
