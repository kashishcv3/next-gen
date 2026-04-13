'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_ip: string;
  total: number;
  order_date: string;
  status: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (filters?: {
    order_id?: string;
    customer_name?: string;
    customer_email?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.order_id) params.append('order_id', filters.order_id);
      if (filters?.customer_name) params.append('customer_name', filters.customer_name);
      if (filters?.customer_email) params.append('customer_email', filters.customer_email);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOrders({
      order_id: searchOrderId,
      customer_name: searchName,
      customer_email: searchEmail,
      date_from: dateFrom,
      date_to: dateTo,
    });
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
      <h1>Order Search</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Criteria</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="orderId">Order ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="orderId"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="Search by Order ID"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="name">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search by Name"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Search by Email"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="dateFrom">Date From</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="dateTo">Date To</label>
                <input
                  type="date"
                  className="form-control"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ marginTop: '25px' }}>
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="fa fa-search"></i> Search
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => {
                    setSearchOrderId('');
                    setSearchName('');
                    setSearchEmail('');
                    setDateFrom('');
                    setDateTo('');
                    setSelectedOrders(new Set());
                    fetchOrders();
                  }
                  style={{ marginLeft: '5px' }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading orders...</div>}

      {!loading && orders.length > 0 && (
        <>
          {/* Bulk Actions */}
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-body">
              <div className="btn-group" role="group">
                <button className="btn btn-default" disabled={selectedOrders.size === 0}>
                  <i className="fa fa-trash"></i> Delete Selected
                </button>
                <button className="btn btn-default" disabled={selectedOrders.size === 0}>
                  <i className="fa fa-print"></i> Print Selected
                </button>
                <button className="btn btn-default" disabled={selectedOrders.size === 0}>
                  <i className="fa fa-download"></i> Export Selected
                </button>
              </div>
              <span style={{ marginLeft: '20px', fontSize: '14px' }}>
                {selectedOrders.size} of {orders.length} selected
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Orders ({orders.length})
              </h3>
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
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>IP Address</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>Actions</th>
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
                      <td>{formatDate(order.order_date)}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_email}</td>
                      <td>{order.customer_ip}</td>
                      <td>{formatCurrency(parseFloat(order.total))}</td>
                      <td>
                        <span className={`label label-${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
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
        </>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="alert alert-info">No orders found matching your criteria.</div>
      )}
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    case 'processing':
      return 'info';
    default:
      return 'default';
  }
}
