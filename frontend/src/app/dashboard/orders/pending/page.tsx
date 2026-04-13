'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface PendingOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  created_at: string;
  status: string;
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [exportType, setExportType] = useState('csv');

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders?status=pending');
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
      setError('Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleReviewSelected = () => {
    alert(`Review ${selectedOrders.size} orders`);
  };

  const handlePrintSelected = () => {
    alert(`Print ${selectedOrders.size} orders`);
  };

  const handleExportSelected = () => {
    alert(`Export ${selectedOrders.size} orders as ${exportType}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Pending Orders</h1>
      <p className="text-muted">
        {orders.length} pending order{orders.length !== 1 ? 's' : ''} awaiting review
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading pending orders...</div>}

      {!loading && (
        <>
          {/* Batch Controls */}
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title">Batch Actions</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-primary"
                      onClick={handleReviewSelected}
                      disabled={selectedOrders.size === 0}
                    >
                      <i className="fa fa-eye"></i> Review & Process
                    </button>
                    <button
                      className="btn btn-default"
                      onClick={handlePrintSelected}
                      disabled={selectedOrders.size === 0}
                    >
                      <i className="fa fa-print"></i> Print
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-inline">
                    <label htmlFor="exportType">Export as:</label>
                    <select
                      id="exportType"
                      className="form-control"
                      style={{ marginLeft: '10px', marginRight: '10px' }}
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="json">JSON</option>
                    </select>
                    <button
                      className="btn btn-info"
                      onClick={handleExportSelected}
                      disabled={selectedOrders.size === 0}
                    >
                      <i className="fa fa-download"></i> Export
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                <strong>{selectedOrders.size} of {orders.length} selected</strong>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length > 0 ? (
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Pending Orders List</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.size === orders.length && orders.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                          />
                        </td>
                        <td>
                          <Link href={`/orders/detail/${order.id}`}>
                            {order.order_id}
                          </Link>
                        </td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_email}</td>
                        <td>{formatCurrency(parseFloat(order.total))}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <Link href={`/orders/detail/${order.id}`} className="btn btn-xs btn-primary">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            !loading && <div className="alert alert-success">No pending orders!</div>
          )}
        </>
      )}
    </div>
  );
}
