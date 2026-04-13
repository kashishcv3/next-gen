'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface FormData {
  include_images: boolean;
  include_categories: boolean;
  sort_by: string;
  delimiter: string;
  product_ids: string[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function ProductExportPage() {
  const [formData, setFormData] = useState<FormData>({
    include_images: false,
    include_categories: true,
    sort_by: 'name',
    delimiter: ',',
    product_ids: [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      const productList = response.data.data || [];
      setProducts(productList);
      setAvailableProducts(productList);
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

  const handleAddProduct = (product: Product) => {
    setSelectedProducts([...selectedProducts, product]);
    setAvailableProducts(availableProducts.filter(p => p.id !== product.id));
  };

  const handleRemoveProduct = (productId: string) => {
    const product = selectedProducts.find(p => p.id === productId);
    if (product) {
      setAvailableProducts([...availableProducts, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setAvailableProducts([...availableProducts, ...selectedProducts].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedProducts([]);
      setAllSelected(false);
    } else {
      setSelectedProducts([...selectedProducts, ...availableProducts]);
      setAvailableProducts([]);
      setAllSelected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExporting(true);
    setError(null);

    try {
      const productIds = selectedProducts.map(p => p.id);
      if (productIds.length === 0) {
        throw new Error('Please select at least one product');
      }

      const response = await api.post('/products/export', {
        product_ids: productIds,
        include_images: formData.include_images,
        include_categories: formData.include_categories,
        sort_by: formData.sort_by,
        delimiter: formData.delimiter,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild?.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Export Products</h1>
          <p>
            <i className="fa fa-download"></i> Select products to export as CSV.
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
                <h3 className="panel-title">Export Settings</h3>
              </div>
              <div className="panel-body">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_images"
                      checked={formData.include_images}
                      onChange={handleInputChange}
                    />
                    Include product images
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_categories"
                      checked={formData.include_categories}
                      onChange={handleInputChange}
                    />
                    Include category assignments
                  </label>
                </div>

                <div className="form-group">
                  <label>Sort By</label>
                  <select
                    className="form-control"
                    name="sort_by"
                    value={formData.sort_by}
                    onChange={handleInputChange}
                  >
                    <option value="name">Product Name</option>
                    <option value="sku">SKU</option>
                    <option value="price">Price</option>
                    <option value="created_date">Created Date</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Delimiter</label>
                  <select
                    className="form-control"
                    name="delimiter"
                    value={formData.delimiter}
                    onChange={handleInputChange}
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab (\t)</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Select Products</h3>
              </div>
              <div className="panel-body">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={handleSelectAll}
                  style={{ marginBottom: '10px' }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>

                <div className="row">
                  <div className="col-md-5">
                    <label>Available Products</label>
                    <select
                      multiple
                      className="form-control"
                      size={12}
                      style={{ height: '300px' }}
                      onChange={(e) => {
                        const productId = e.target.value;
                        if (productId) {
                          const product = availableProducts.find(p => p.id === productId);
                          if (product) {
                            handleAddProduct(product);
                          }
                        }
                      }
                    >
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 text-center" style={{ paddingTop: '130px' }}>
                    <button
                      type="button"
                      className="btn btn-default btn-block"
                      onClick={() => {
                        const selected = availableProducts[0];
                        if (selected) handleAddProduct(selected);
                      }
                      disabled={availableProducts.length === 0}
                    >
                      &gt;
                    </button>
                    <button
                      type="button"
                      className="btn btn-default btn-block"
                      onClick={() => {
                        const selected = selectedProducts[0];
                        if (selected) handleRemoveProduct(selected.id);
                      }
                      disabled={selectedProducts.length === 0}
                    >
                      &lt;
                    </button>
                  </div>

                  <div className="col-md-5">
                    <label>Products to Export ({selectedProducts.length})</label>
                    <select
                      multiple
                      className="form-control"
                      size={12}
                      style={{ height: '300px' }}
                    >
                      {selectedProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={exporting || selectedProducts.length === 0}
            >
              {exporting ? 'Exporting...' : 'Export Products'}
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
