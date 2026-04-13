'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface WholesaleOrder {
  id: string;
  order_id: string;
  wholesale_id: string;
  total: number;
  status: string;
  created_at: string;
}

export default function WholesaleOrderListPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/wholesale/orders?${params.toString()}`);
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders(search);
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

  if (loading) return <div className="alert alert-info">Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Orders</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-md-6">
              <button className="btn btn-primary" onClick={handleSearch}>
                <i className="fa fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Orders ({orders.length})</h3>
        </div>
        {orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_id}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`label label-${order.status === 'completed' ? 'success' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <Link href={`/wholesale/order/detail/${order.id}`} className="btn btn-xs btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
