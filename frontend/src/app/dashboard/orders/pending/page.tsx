'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PendingOrder {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  date_ordered: string;
  status: string;
  payment_method?: string;
}

interface OrdersResponse {
  total: number;
  page: number;
  page_size: number;
  items: PendingOrder[];
}

export default function PendingOrdersPage() {
  const searchParams = useSearchParams();
  // site_id is auto-injected by the API interceptor from StoreContext

  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [exportType, setExportType] = useState('csv');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchPendingOrders();
  }, [currentPage]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrdersResponse>('/orders/pending', {
        params: { page: currentPage, page_size: 20 },
      });
      setOrders(response.data.items || []);
      setTotalResults(response.data.total || 0);
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

  const handleSelectOrder = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleReviewSelected = () => {
    alert(`Review ${selectedOrders.size} orders - Feature coming soon`);
  };

  const handlePrintSelected = () => {
    alert(`Print ${selectedOrders.size} orders - Feature coming soon`);
  };

  const handleExportSelected = () => {
    alert(`Export ${selectedOrders.size} orders as ${exportType} - Feature coming soon`);
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
      <h1>Pending/New Orders</h1>
      <p className="text-muted">
        <i className="fa fa-info-circle"></i> {totalResults} pending order{totalResults !== 1 ? 's' : ''} awaiting review
      </p>

      {error && <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>}
      {loading && <div className="alert alert-info"><i className="fa fa-spinner fa-spin"></i> Loading pending orders...</div>}

      {!loading && (
        <>
          {/* Batch Controls */}
          {orders.length > 0 && (
            <div className="panel panel-default" style={{ marginBottom: '20px' }}>
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Batch Actions</h3>
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
                        <i className="fa fa-print"></i> Print Selected
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-inline">
                      <label htmlFor="exportType" style={{ marginRight: '10px' }}>Export as:</label>
                      <select
                        id="exportType"
                        className="form-control"
                        style={{ marginRight: '10px' }}
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
          )}

          {/* Orders Table */}
          {orders.length > 0 ? (
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-list"></i> Pending Orders List</h3>
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
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Status</th>
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
                          <Link href={`/dashboard/orders/${order.order_id}`} className="text-primary">
                            {String(order.order_id).padStart(4, '0')}
                          </Link>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(order.date_ordered)}
                        </td>
                        <td>{order.customer_name}</td>
                        <td>{order.customer_email}</td>
                        <td>{formatCurrency(order.total_price)}</td>
                        <td>
                          <span className="label label-warning">
                            {order.status}
                          </span>
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
          ) : (
            !loading && (
              <div className="alert alert-success">
                <i className="fa fa-check-circle"></i> No pending orders! All orders have been processed.
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
