'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Order {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  ip: string;
  total_price: number;
  date_ordered: string;
  status: string;
  payment_method?: string;
  invalid?: string;
  incomplete?: string;
}

interface OrdersResponse {
  total: number;
  page: number;
  page_size: number;
  items: Order[];
}

export default function OrderListPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('site_id') || '1';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchBy, setSearchBy] = useState('order_id');
  const [searchFor, setSearchFor] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [useWildcard, setUseWildcard] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [incompletePaypal, setIncompletePaypal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const searchOptions = {
    'order_id': 'Order ID',
    'email': 'Email Address',
    'last_name': 'Customer Name',
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async (filters?: {
    search_by?: string;
    search_for?: string;
    date_from?: string;
    date_to?: string;
    use_wildcard?: boolean;
    incomplete_paypal?: boolean;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('site_id', siteId);
      params.append('page', currentPage.toString());
      params.append('page_size', '20');

      if (filters?.search_by) params.append('search_by', filters.search_by);
      if (filters?.search_for) params.append('search_for', filters.search_for);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.use_wildcard) params.append('use_wildcard', 'y');
      if (filters?.incomplete_paypal) params.append('incomplete_paypal', 'y');

      const response = await api.get<OrdersResponse>(`/orders?${params.toString()}`);
      setOrders(response.data.items || []);
      setTotalResults(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders({
      search_by: searchBy,
      search_for: searchFor,
      date_from: dateFrom,
      date_to: dateTo,
      use_wildcard: useWildcard && (searchBy === 'email' || searchBy === 'last_name'),
      incomplete_paypal: incompletePaypal,
    });
  };

  const handleClear = () => {
    setSearchBy('order_id');
    setSearchFor('');
    setDateFrom('');
    setDateTo('');
    setUseWildcard(false);
    setIncompletePaypal(false);
    setSelectedOrders(new Set());
    setCurrentPage(1);
    fetchOrders();
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalPages = Math.ceil(totalResults / 20);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Search</h1>
      <p className="text-muted">
        <i className="fa fa-info-circle"></i> Search for previously placed orders.
      </p>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title"><i className="fa fa-search"></i> Search Criteria</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="searchBy">Search By:</label>
                <select
                  id="searchBy"
                  className="form-control"
                  value={searchBy}
                  onChange={(e) => {
                    setSearchBy(e.target.value);
                    setUseWildcard(false);
                  }}
                >
                  {Object.entries(searchOptions).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="searchFor">Search For:</label>
                <input
                  type="text"
                  className="form-control"
                  id="searchFor"
                  value={searchFor}
                  onChange={(e) => setSearchFor(e.target.value)}
                  placeholder="Enter search term"
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label>&nbsp;</label>
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    <i className="fa fa-search"></i> Search
                  </button>
                  <button
                    className="btn btn-default"
                    onClick={handleClear}
                    style={{ marginLeft: '5px' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: '15px' }}>
            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="dateFrom">Date From (mm/dd/yyyy):</label>
                <input
                  type="text"
                  className="form-control"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label htmlFor="dateTo">Date To (mm/dd/yyyy):</label>
                <input
                  type="text"
                  className="form-control"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group">
                <label>&nbsp;</label>
                <div>
                  <label style={{ marginTop: '5px' }}>
                    <input
                      type="checkbox"
                      checked={incompletePaypal}
                      onChange={(e) => setIncompletePaypal(e.target.checked)}
                    />
                    {' '}Incomplete PayPal Orders Only
                  </label>
                </div>
              </div>
            </div>
          </div>

          {(searchBy === 'email' || searchBy === 'last_name') && (
            <div className="row">
              <div className="col-md-12">
                <label>
                  <input
                    type="checkbox"
                    checked={useWildcard}
                    onChange={(e) => setUseWildcard(e.target.checked)}
                  />
                  {' '}Use Wildcard Match
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>}
      {loading && <div className="alert alert-info"><i className="fa fa-spinner fa-spin"></i> Loading orders...</div>}

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
                Order Results ({totalResults} total)
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
                    <th>Date Ordered</th>
                    <th>Customer Email</th>
                    <th>IP Address</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ width: '100px' }}>Move to Pending</th>
                    <th style={{ width: '80px' }}>Delete</th>
                    <th style={{ width: '60px' }}>Actions</th>
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
                        <Link href={`/dashboard/orders/${order.order_id}`} className="text-primary">
                          {String(order.order_id).padStart(4, '0')}
                        </Link>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDate(order.date_ordered)}
                      </td>
                      <td>{order.customer_email}</td>
                      <td>{order.ip}</td>
                      <td>{formatCurrency(order.total_price)}</td>
                      <td>
                        <span className={`label label-${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <input type="checkbox" disabled />
                      </td>
                      <td className="text-center">
                        <input type="checkbox" disabled />
                      </td>
                      <td>
                        <Link href={`/dashboard/orders/${order.order_id}`} className="btn btn-xs btn-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="panel-footer text-center">
                <nav>
                  <ul className="pagination" style={{ margin: '0' }}>
                    <li className={currentPage === 1 ? 'disabled' : ''}>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-link"
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={currentPage === page ? 'active' : ''}>
                        <button
                          onClick={() => setCurrentPage(page)}
                          className="btn btn-link"
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={currentPage === totalPages ? 'disabled' : ''}>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-link"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && orders.length === 0 && !error && totalResults === 0 && (
        <div className="alert alert-info">
          <i className="fa fa-info-circle"></i> There were no results for your search
        </div>
      )}
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'received':
    case 'shipped':
      return 'success';
    case 'pending':
    case 'new':
      return 'warning';
    case 'cancelled':
    case 'failed':
      return 'danger';
    case 'processing':
    case 'paid':
      return 'info';
    default:
      return 'default';
  }
}
