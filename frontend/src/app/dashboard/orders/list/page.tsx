'use client';

import React, { useState, useEffect, Fragment } from 'react';
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
  tracking?: string;
  cs_note?: string;
  active?: string;
}

interface OrdersResponse {
  total: number;
  page: number;
  page_size: number;
  items: Order[];
}

export default function OrderListPage() {
  const searchParams = useSearchParams();
  // site_id is auto-injected by the API interceptor from StoreContext

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchBy, setSearchBy] = useState('order_id');
  const [searchFor, setSearchFor] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [useWildcard, setUseWildcard] = useState(false);
  const [incompletePaypal, setIncompletePaypal] = useState(false);
  const [amazonPay, setAmazonPay] = useState(false);
  const [amazonPayStatus, setAmazonPayStatus] = useState('');
  const [amazonPayOrderId, setAmazonPayOrderId] = useState('');
  const [subscriptionOrders, setSubscriptionOrders] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Map<number, string>>(new Map());
  const [pendingOrders, setPendingOrders] = useState<Map<number, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const searchOptions = {
    'order_id': 'Order ID',
    'email': 'Email Address',
    'last_name': 'Customer Name',
  };

  const amazonPayStatusOptions = {
    'pending': 'Pending',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
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
    amazon_pay?: boolean;
    amazon_pay_status?: string;
    amazon_pay_orderid?: string;
    subscription_orders?: boolean;
  }, pageNum?: number) => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: pageNum || currentPage,
        page_size: 20,
      };

      if (filters?.search_by) params.search_by = filters.search_by;
      if (filters?.search_for) params.search_for = filters.search_for;
      if (filters?.date_from) params.date_from = filters.date_from;
      if (filters?.date_to) params.date_to = filters.date_to;
      if (filters?.use_wildcard) params.use_wildcard = 'y';
      if (filters?.incomplete_paypal) params.incomplete_paypal = 'y';
      if (filters?.amazon_pay) params.amazon_pay = 'y';
      if (filters?.amazon_pay_status) params.amazon_pay_status = filters.amazon_pay_status;
      if (filters?.amazon_pay_orderid) params.amazon_pay_orderid = filters.amazon_pay_orderid;
      if (filters?.subscription_orders) params.subscription_orders = 'y';

      const response = await api.get<OrdersResponse>('/orders', { params });
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
      amazon_pay: amazonPay,
      amazon_pay_status: amazonPayStatus,
      amazon_pay_orderid: amazonPayOrderId,
      subscription_orders: subscriptionOrders,
    }, 1);
  };

  const handleClear = () => {
    setSearchBy('order_id');
    setSearchFor('');
    setDateFrom('');
    setDateTo('');
    setUseWildcard(false);
    setIncompletePaypal(false);
    setAmazonPay(false);
    setAmazonPayStatus('');
    setAmazonPayOrderId('');
    setSubscriptionOrders(false);
    setSelectedOrders(new Map());
    setPendingOrders(new Map());
    setCurrentPage(1);
    fetchOrders({}, 1);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Map());
    } else {
      const newSelected = new Map<number, string>();
      orders.forEach((o) => {
        newSelected.set(o.id, 'delete');
      });
      setSelectedOrders(newSelected);
    }
  };

  const handleSelectOrder = (orderId: number, type: string) => {
    const newSelected = new Map(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.set(orderId, type);
    }
    setSelectedOrders(newSelected);
  };

  const toggleOrderExpanded = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandedOrders.size === orders.length) {
      setExpandedOrders(new Set());
    } else {
      setExpandedOrders(new Set(orders.map((o) => o.order_id)));
    }
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
      <div className="row">
        <div className="col-lg-12">
          <h1>View Orders</h1>
          <p>
            <i className="fa fa-info-circle"></i> Search for previously placed orders.
          </p>
          <p>
            <span className="label label-warning">Note</span> Please use the "Date Range" fields when using "Date Ordered" or "Ship On Date" options and the "Search For" field for all other search options for accurate search results.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-cogs"></i> Order Search</h3>
            </div>
            <div className="panel-body">
              <table className="table cv3-data-table">
                <thead>
                  <tr>
                    <th valign="top">
                      <b>Search By:</b>
                    </th>
                    <th valign="top">
                      <b>Search For:</b>
                    </th>
                    <th className="text-center" colSpan={2} valign="top">
                      <b>Date Range (mm/dd/yyyy):</b>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td valign="top">
                      <br />
                      <select className="form-control" value={searchBy} onChange={(e) => {
                        setSearchBy(e.target.value);
                        setUseWildcard(false);
                      }}>
                        {Object.entries(searchOptions).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td valign="top">
                      <br />
                      <input className="form-control" type="text" value={searchFor} onChange={(e) => setSearchFor(e.target.value)} size={20} maxLength={255} />
                      <br />
                      <br />
                      <label>
                        <input type="checkbox" checked={subscriptionOrders} onChange={(e) => setSubscriptionOrders(e.target.checked)} />
                        {' '}Search Active Subscription Orders Only
                      </label>
                      <br />
                      <label>
                        <input type="checkbox" checked={incompletePaypal} onChange={(e) => setIncompletePaypal(e.target.checked)} />
                        {' '}Search Incomplete PayPal Orders Only
                      </label>
                      <br />
                      <label>
                        <input type="checkbox" checked={amazonPay} onChange={(e) => setAmazonPay(e.target.checked)} />
                        {' '}Search Amazon Pay Orders Only
                      </label>
                      <select className="form-control form-control-inline" value={amazonPayStatus} onChange={(e) => setAmazonPayStatus(e.target.value)}>
                        <option value="">-- All Amazon Pay Status --</option>
                        {Object.entries(amazonPayStatusOptions).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <input className="form-control form-control-inline" placeholder="Amazon Pay Order ID" type="text" value={amazonPayOrderId} onChange={(e) => setAmazonPayOrderId(e.target.value)} size={20} maxLength={255} />
                      <br />
                      {(searchBy === 'email' || searchBy === 'last_name') && (
                        <div>
                          <label>
                            <input type="checkbox" checked={useWildcard} onChange={(e) => setUseWildcard(e.target.checked)} />
                            {' '}Use Wildcard Match
                          </label>
                        </div>
                      )}
                    </td>
                    <td valign="top">
                      From: <br />
                      <input className="form-control datepicker" type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} size={10} maxLength={10} />
                      <br /><br />
                      <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                    </td>
                    <td valign="top">
                      To: <br />
                      <input className="form-control datepicker" type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} size={10} maxLength={10} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <br />

      {error && <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>}

      {!loading && orders.length > 0 && (
        <>
          {orders.length > 0 && (
            <div className="row">
              <div className="col-lg-12">
                <p><button type="button" className="btn btn-primary btn-sm" onClick={toggleExpandAll}>{expandedOrders.size === orders.length ? 'Collapse All' : 'Expand All'}</button></p>
              </div>
            </div>
          )}

          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-cogs"></i> Order Results</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={(e) => e.preventDefault()} id="order_search">
                <input type="hidden" name="action" value="UpdateOrders" />
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date Ordered</th>
                      <th>User Email</th>
                      <th>IP Address</th>
                      <th>Total</th>
                      <th className="text-center">
                        Move to Pending <input type="checkbox" onChange={handleSelectAll} checked={selectedOrders.size > 0 && selectedOrders.size === orders.length} />
                      </th>
                      <th className="text-center">
                        Delete <input type="checkbox" onChange={handleSelectAll} checked={selectedOrders.size > 0 && selectedOrders.size === orders.length} />
                      </th>
                      <th className="text-center">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>
                            <Link href={`/dashboard/orders/${order.order_id}`}>
                              {String(order.order_id).padStart(4, '0')}
                            </Link>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {order.date_ordered}
                          </td>
                          <td>
                            {order.customer_email}
                          </td>
                          <td>
                            {order.ip}
                          </td>
                          <td>
                            {formatCurrency(order.total_price)}
                          </td>
                          <td className="text-center">
                            {!order.invalid && (!order.invalid || (order.payment_method === 'paypal' || order.payment_method === 'paypal_express') && !order.invalid) ? (
                              <input type="checkbox" id={`pending${order.order_id}`} name="pending[]" value={String(order.order_id)} />
                            ) : (
                              <span>&nbsp;</span>
                            )}
                          </td>
                          <td className="text-center">
                            {!order.invalid ? (
                              <input type="checkbox" name="delete[]" id={`delete${order.order_id}`} value={String(order.order_id)} />
                            ) : order.invalid === 'a' ? (
                              <span style={{ color: 'red' }}>Awaiting Amazon</span>
                            ) : order.incomplete === 'y' ? (
                              <span style={{ color: 'red' }}>Incomplete Order</span>
                            ) : order.incomplete === 'ss' ? (
                              <span style={{ color: 'red' }}>Fraud Flagged</span>
                            ) : order.payment_method === 'paypal' || order.payment_method === 'paypal_express' ? (
                              <span style={{ color: 'red' }}>Incomplete PayPal</span>
                            ) : (
                              <span style={{ color: 'red' }}>Deleted</span>
                            )}
                          </td>
                          <td className="cv3-actions" style={{ whiteSpace: 'nowrap' }}>
                            <div data-toggle="collapse" data-target={`#tracking-${order.order_id}`} style={{ cursor: 'pointer' }}>
                              <a title="Edit" data-toggle="tooltip" className="edit-tooltip" onClick={() => toggleOrderExpanded(order.order_id)}>
                                <i className="fa fa-pencil"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={8} style={{ padding: '2px' }}>
                            <div className={`collapse ${expandedOrders.has(order.order_id) ? 'in' : ''}`} id={`tracking-${order.order_id}`}>
                              <div className="form-group" style={{ padding: '10px' }}>
                                <label>Customer Type: {order.active === '1' ? 'Member' : order.active === '2' ? 'Member Placed as Guest' : 'Guest'}</label>
                                {order.active === '2' && (
                                  <div style={{ paddingLeft: '20px', paddingBottom: '10px' }}>
                                    <label>
                                      <input type="checkbox" name={`associate_${order.order_id}`} value="y" />
                                      {' '}Associate with member account (billing address will be overwriten by member information)
                                    </label>
                                  </div>
                                )}
                                <label>Status</label>
                                <input className="form-control" type="text" name={`status_${order.order_id}`} defaultValue={order.status} />
                                <label>Tracking</label>
                                <input className="form-control" type="text" name={`tracking_${order.order_id}`} size={25} defaultValue={order.tracking || ''} />
                                <label>Internal Order Note <span style={{ fontWeight: 'normal' }}>(only visible in store admin)</span></label>
                                <textarea className="form-control" id={`cs_note_${order.order_id}`} name={`cs_note_${order.order_id}`} rows={4} defaultValue={order.cs_note || ''} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </form>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ float: 'right', marginTop: '15px' }}>
                  {currentPage > 1 && (
                    <button className="btn btn-link" onClick={() => { setCurrentPage(currentPage - 1); fetchOrders(undefined, currentPage - 1); }}>Previous</button>
                  )}
                  {currentPage > 1 && <span>&nbsp;&nbsp;</span>}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} className="btn btn-link" onClick={() => { setCurrentPage(page); fetchOrders(undefined, page); }} style={{ fontWeight: currentPage === page ? 'bold' : 'normal' }}>
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && <span>&nbsp;&nbsp;</span>}
                  {currentPage < totalPages && (
                    <button className="btn btn-link" onClick={() => { setCurrentPage(currentPage + 1); fetchOrders(undefined, currentPage + 1); }}>Next</button>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-center" style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleSearch}>Update Orders</button>
          </p>
        </>
      )}

      {!loading && orders.length === 0 && totalResults > 0 && (
        <div className="alert alert-info">
          <i className="fa fa-info-circle"></i> Your search produced too many results. Please narrow your search and try again.
        </div>
      )}

      {!loading && orders.length === 0 && !error && totalResults === 0 && (
        <div className="alert alert-info">
          <i className="fa fa-info-circle"></i> There were no results for your search
        </div>
      )}

      {loading && (
        <div className="alert alert-info">
          <i className="fa fa-spinner fa-spin"></i> Loading orders...
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
