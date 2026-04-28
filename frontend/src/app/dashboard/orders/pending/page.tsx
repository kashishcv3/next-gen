'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface PendingOrder {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  date_ordered: string;
  status: string;
  ip?: string;
  payment_method?: string;
  invalid?: string;
  incomplete?: string;
}

interface OrdersResponse {
  total: number;
  page: number;
  page_size: number;
  items: PendingOrder[];
}

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedPending, setSelectedPending] = useState<number[]>([]);
  const [selectedDelete, setSelectedDelete] = useState<number[]>([]);
  const pageSize = 50;

  useEffect(() => {
    fetchPendingOrders();
  }, [currentPage]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrdersResponse>('/orders/pending', {
        params: { page: currentPage, page_size: pageSize },
      });
      setOrders(response.data.items || []);
      setTotalResults(response.data.total || 0);
      setError(null);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAction = (actionType: string) => {
    const orderIds = orders.map(o => o.order_id).join(',');
    alert(`${actionType}: ${orders.length} orders selected (IDs: ${orderIds.substring(0, 60)}...)\n\nBatch export functionality coming soon.`);
  };

  const handleSelectAllPending = (checked: boolean) => {
    if (checked) {
      setSelectedPending(orders.map(o => o.order_id));
    } else {
      setSelectedPending([]);
    }
  };

  const handleSelectAllDelete = (checked: boolean) => {
    if (checked) {
      setSelectedDelete(orders.filter(o => o.invalid !== 'y' && o.invalid !== 'a').map(o => o.order_id));
    } else {
      setSelectedDelete([]);
    }
  };

  const togglePending = (orderId: number) => {
    setSelectedPending(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleDelete = (orderId: number) => {
    setSelectedDelete(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className="row">
      <div className="col-lg-12">
        <h1>Pending Orders</h1>
        <p>
          <i className="fa fa-info-circle"></i> View and export pending orders.{' '}
          <strong>When printing orders, please click the button once and wait for the next page to load completely.</strong>{' '}
          Your orders will be exported.
        </p>
      </div>

      {error && (
        <div className="col-lg-12">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="col-lg-12">
          <div className="alert alert-info">
            <i className="fa fa-spinner fa-spin"></i> Loading pending orders...
          </div>
        </div>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="col-lg-12" style={{ marginBottom: '15px' }}>
            {orders.length > 0 ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => handlePrintAction('Review & Print Orders')}
                  style={{ marginRight: '5px' }}
                >
                  <i className="fa fa-eye"></i> Review &amp; Print Orders
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handlePrintAction('Print Orders')}
                  style={{ marginRight: '5px' }}
                >
                  <i className="fa fa-print"></i> Print Orders
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => handlePrintAction('Re-Print Last Batch')}
                >
                  <i className="fa fa-repeat"></i> Re-Print Last Batch
                </button>
              </>
            ) : (
              <button
                className="btn btn-default"
                onClick={() => handlePrintAction('Re-Export Last Batch')}
              >
                <i className="fa fa-repeat"></i> Re-Export Last Batch
              </button>
            )}
          </div>

          {/* Orders Panel */}
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Pending Orders
                  {totalResults > 0 && ` (${totalResults} total)`}
                </h3>
              </div>
              <div className="panel-body">
                {orders.length === 0 ? (
                  <p className="text-center">There were no results for your search</p>
                ) : (
                  <>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date Ordered</th>
                          <th>Customer</th>
                          <th>User Email</th>
                          <th>IP Address</th>
                          <th>Total</th>
                          <th className="text-center">
                            Move to Pending{' '}
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllPending(e.target.checked)}
                              checked={selectedPending.length === orders.length && orders.length > 0}
                            />
                          </th>
                          <th className="text-center">
                            Delete{' '}
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAllDelete(e.target.checked)}
                            />
                          </th>
                          <th className="text-center">&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.order_id}>
                            <td>
                              <Link href={`/dashboard/orders/detail/${order.order_id}`}>
                                {order.order_id}
                              </Link>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>{order.date_ordered}</td>
                            <td>{order.customer_name}</td>
                            <td>{order.customer_email}</td>
                            <td>{order.ip || ''}</td>
                            <td>${Number(order.total_price).toFixed(2)}</td>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={selectedPending.includes(order.order_id)}
                                onChange={() => togglePending(order.order_id)}
                              />
                            </td>
                            <td className="text-center">
                              {order.invalid === 'y' ? (
                                order.incomplete === 'y' ? (
                                  <span style={{ color: '#ff0000' }}>Incomplete Order</span>
                                ) : order.incomplete === 'ss' ? (
                                  <span style={{ color: '#ff0000' }}>Fraud Flagged</span>
                                ) : (order.payment_method === 'paypal' || order.payment_method === 'paypal_express') ? (
                                  <span style={{ color: '#ff0000' }}>Incomplete PayPal</span>
                                ) : (
                                  <span style={{ color: '#ff0000' }}>Deleted</span>
                                )
                              ) : order.invalid === 'a' ? (
                                <span style={{ color: 'red' }}>Awaiting Amazon</span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={selectedDelete.includes(order.order_id)}
                                  onChange={() => toggleDelete(order.order_id)}
                                />
                              )}
                            </td>
                            <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                              <Link
                                href={`/dashboard/orders/detail/${order.order_id}`}
                                title="Edit"
                                className="edit-tooltip"
                              >
                                <i className="fa fa-pencil"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Update button */}
                    <p className="text-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          alert(
                            `Update Orders:\n- Move to Pending: ${selectedPending.length} orders\n- Delete: ${selectedDelete.length} orders\n\nBatch update functionality coming soon.`
                          );
                        }}
                      >
                        <i className="fa fa-save"></i> Update Orders
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="col-lg-12">
              <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                {currentPage > 1 && (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage - 1);
                    }}
                    style={{ marginRight: '5px' }}
                  >
                    Previous
                  </a>
                )}
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const start = Math.max(1, currentPage - 5);
                  const page = start + i;
                  if (page > totalPages) return null;
                  return (
                    <span key={page} style={{ marginRight: '5px' }}>
                      {currentPage === page ? (
                        <strong>{page}</strong>
                      ) : (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </a>
                      )}
                    </span>
                  );
                })}
                {currentPage < totalPages && (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
