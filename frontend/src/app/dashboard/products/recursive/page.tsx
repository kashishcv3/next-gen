'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  parent_product_id: string | null;
  depth: number;
}

export default function ProductRecursivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/recursive');
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
          <h1>Recursive Products</h1>
          <p><i className="fa fa-sitemap"></i> View product hierarchy.</p>
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
                <h3 className="panel-title">Product Hierarchy ({products.length})</h3>
              </div>
              <div className="panel-body">
                {products.length === 0 ? (
                  <p className="text-muted">No products found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Parent ID</th>
                        <th>Depth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td style={{ paddingLeft: `${product.depth * 20}px` }}>
                            {product.name}
                          </td>
                          <td>{product.parent_product_id || '-'}</td>
                          <td>{product.depth}</td>
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
