'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface InventoryItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reorder_level: number;
}

export default function ProductInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/inventory', {
        params: { filter },
      });
      setItems(response.data.data || []);
    } catch (err) {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await api.put(`/products/inventory/${itemId}`, { quantity: newQuantity });
      setItems(items.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Inventory Control</h1>
          <p><i className="fa fa-inbox"></i> Manage product inventory levels.</p>
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

      <div className="row">
        <div className="col-lg-12">
          <div className="form-group">
            <label>Filter</label>
            <select
              className="form-control"
              style={{ width: '200px' }}
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                fetchInventory();
              }
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Inventory ({items.length})</h3>
              </div>
              <div className="panel-body">
                {items.length === 0 ? (
                  <p className="text-muted">No items found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Reorder Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.sku}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: '100px' }}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            />
                          </td>
                          <td>{item.reorder_level}</td>
                          <td>
                            {item.quantity === 0 ? (
                              <span className="badge badge-danger">Out of Stock</span>
                            ) : item.quantity <= item.reorder_level ? (
                              <span className="badge badge-warning">Low Stock</span>
                            ) : (
                              <span className="badge badge-success">In Stock</span>
                            )}
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
