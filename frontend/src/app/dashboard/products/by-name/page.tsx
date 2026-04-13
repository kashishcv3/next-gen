'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function ProductByNamePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?sort=name');
      setProducts(response.data.data || []);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Products by Name</h1>
          <p><i className="fa fa-list"></i> View products sorted alphabetically.</p>
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
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Products ({products.length})</h3>
              </div>
              <div className="panel-body">
                {products.length === 0 ? (
                  <p className="text-muted">No products found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>
                            <Link href={`/products/edit/${product.id}`} className="btn btn-sm btn-default">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
