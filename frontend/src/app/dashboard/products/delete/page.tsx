'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function ProductDeletePage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setAllProducts(response.data.data || []);
      setAvailableProducts(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const moveToSelected = () => {
    const newAvailable = availableProducts.filter(p => !selectedProducts.includes(p.id));
    const newSelected = [
      ...selectedProducts,
      ...availableProducts.filter(p => selectedProducts.includes(p.id)).map(p => p.id),
    ];
    setAvailableProducts(newAvailable);
    setSelectedProducts(newSelected);
  };

  const moveToAvailable = () => {
    const selected = allProducts.filter(p => selectedProducts.includes(p.id));
    const newAvailable = [...availableProducts, ...selected];
    setAvailableProducts(newAvailable.sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedProducts(selectedProducts.filter(id => !selected.map(p => p.id).includes(id)));
  };

  const handleAvailableSelect = (productId: string) => {
    // Add to selected
    setSelectedProducts([...selectedProducts, productId]);
    setAvailableProducts(availableProducts.filter(p => p.id !== productId));
  };

  const handleSelectedDeselect = (productId: string) => {
    // Remove from selected
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setAvailableProducts([...availableProducts, product].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      setError('Please select products to delete');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await api.post('/products/delete', { product_ids: selectedProducts });
      router.push('/products/list');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete products');
    } finally {
      setDeleting(false);
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

  const selectedProductsList = allProducts.filter(p => selectedProducts.includes(p.id));

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Delete Products</h1>
          <p>
            <i className="fa fa-warning"></i> Select products to delete. This action cannot be undone.
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
                <h3 className="panel-title">Select Products to Delete</h3>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-5">
                    <label>Available Products</label>
                    <select
                      multiple
                      className="form-control"
                      size={12}
                      onChange={(e) => {
                        const productId = e.target.value;
                        if (productId) {
                          handleAvailableSelect(productId);
                        }
                      }
                      style={{ height: '300px' }}
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
                      onClick={moveToSelected}
                      disabled={availableProducts.length === 0}
                    >
                      &gt;&gt;
                    </button>
                    <br />
                    <button
                      type="button"
                      className="btn btn-default btn-block"
                      onClick={moveToAvailable}
                      disabled={selectedProductsList.length === 0}
                    >
                      &lt;&lt;
                    </button>
                  </div>

                  <div className="col-md-5">
                    <label>Products to Delete</label>
                    <select
                      multiple
                      className="form-control"
                      size={12}
                      onChange={(e) => {
                        const productId = e.target.value;
                        if (productId) {
                          handleSelectedDeselect(productId);
                        }
                      }
                      style={{ height: '300px' }}
                    >
                      {selectedProductsList.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }} className="alert alert-warning">
                  <strong>Warning:</strong> {selectedProducts.length} product(s) will be permanently deleted.
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={deleting || selectedProducts.length === 0}
            >
              {deleting ? 'Deleting...' : 'Delete Selected Products'}
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
