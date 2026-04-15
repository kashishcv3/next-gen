'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  od_subscription?: string;
  od_subscription_id?: string;
  od_subscription_frequency?: string;
  od_active_subscription?: string;
  extra?: string;
  artifi_design_id?: string;
}

interface ShipToAddress {
  uship_id: number;
  ship_name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  message?: string;
  subtotal: number;
  detail_tax: number;
  detail_ship: number;
  gifttotal: number;
  products: OrderItem[];
}

interface OrderDetail {
  order_id: number;
  customer_name: string;
  customer_email: string;
  customer_ip: string;
  total_price: number;
  total_tax: number;
  total_shipping: number;
  total_fees: number;
  status: string;
  date_ordered: string;
  date_updated?: string;
  payment_method?: string;
  payment_gateway?: string;
  transaction_id?: string;
  billing_address1: string;
  billing_address2?: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  billing_phone?: string;
  active?: string;
  subtotal: number;
  discount: number;
  discount_type?: string;
  gifttotal: number;
  cust_1?: string;
  cust_2?: string;
  cust_3?: string;
  comments?: string;
  order_details: ShipToAddress[];
  items: OrderItem[];
  invalid?: string;
  incomplete?: string;
  tracking?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  // site_id is auto-injected by the API interceptor from StoreContext

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get<OrderDetail>(`/orders/${orderId}`);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">
          <i className="fa fa-spinner fa-spin"></i> Loading order details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle"></i> {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-warning">
          <i className="fa fa-info-circle"></i> Order not found
        </div>
      </div>
    );
  }

  const calculatedTotal = order.subtotal + order.total_shipping + order.total_tax;
  const discountAmount = calculatedTotal > order.total_price ? calculatedTotal - order.total_price : 0;
  const discountPercent = discountAmount > 0 ? ((discountAmount / order.subtotal) * 100).toFixed(2) : 0;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>{order.customer_name} Order Detail</h1>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          {order.order_details && order.order_details.length > 1 && (
            <p className="text-center">
              <span>&nbsp;Viewing order {String(order.order_id).padStart(4, '0')} with {order.order_details.length} shipping address(es).</span>
            </p>
          )}
          {order.customer_ip && (
            <p className="text-center">
              Ordered from IP Address {order.customer_ip}.
            </p>
          )}
        </div>
      </div>

      {/* General Order Information */}
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title"><i className="fa fa-cogs"></i> General Order Information</h3>
        </div>
        <div className="panel-body">
          <table className="table-responsive" width="100%">
            <tbody>
              <tr>
                <td><strong>Order ID:</strong></td>
                <td>{String(order.order_id).padStart(4, '0')}</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td><span className={`label label-${getStatusClass(order.status)}`}>{order.status}</span></td>
              </tr>
              <tr>
                <td><strong>Date Ordered:</strong></td>
                <td>{order.date_ordered}</td>
              </tr>
              <tr>
                <td><strong>Customer Type:</strong></td>
                <td>{order.active === '1' ? 'Member' : order.active === '2' ? 'Member Placed as Guest' : 'Guest'}</td>
              </tr>
              <tr>
                <td><strong>Customer Name:</strong></td>
                <td>{order.customer_name}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td><a href={`mailto:${order.customer_email}`}>{order.customer_email}</a></td>
              </tr>
              <tr>
                <td><strong>Payment Method:</strong></td>
                <td>{order.payment_method || 'N/A'}</td>
              </tr>
              {order.transaction_id && (
                <tr>
                  <td><strong>Transaction ID:</strong></td>
                  <td>{order.transaction_id}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2}><strong>Comments:</strong> {order.comments || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail - Each Ship-To Address */}
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 className="panel-title"><i className="fa fa-cogs"></i> Order Detail</h3>
        </div>
        <div className="panel-body">
          <table className="table-responsive" width="100%">
            <tbody>
              {order.order_details && order.order_details.map((shipto, idx) => (
                <React.Fragment key={shipto.uship_id}>
                  <tr>
                    <th colSpan={2}>
                      <b>Order Detail: Ship-To Address {idx + 1}</b>
                    </th>
                  </tr>
                  <tr>
                    <td colSpan={2}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td><strong>Ship Name:</strong></td>
                    <td>{shipto.ship_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Address:</strong></td>
                    <td>
                      {shipto.address1}
                      {shipto.address2 && <><br />{shipto.address2}</>}
                      <br />
                      {shipto.city}, {shipto.state} {shipto.zip}
                      <br />
                      {shipto.country}
                    </td>
                  </tr>
                  {shipto.message && (
                    <tr>
                      <td colSpan={2}>
                        <strong>Gift Message:</strong><br />{shipto.message.replace(/[:]/g, '<br />')}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={2} align="right">
                      <table width="98%" className="table table-responsive table-striped">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th align="right" width="5%">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipto.products.map((product, pidx) => (
                            <tr key={pidx}>
                              <td valign="top">{product.sku}</td>
                              <td valign="top">{formatCurrency(product.unit_price)}</td>
                              <td valign="top">
                                {product.product_name}
                                {product.extra && <>{product.extra}</> }
                                {product.artifi_design_id && (
                                  <>
                                    <br />
                                    <a href="javascript: void(0);">Preview</a>&nbsp;
                                    <a href="javascript: void(0);">Download PDF</a>
                                  </>
                                )}
                                {product.od_subscription === 'y' && (
                                  <>
                                    <br />
                                    Sub ID: {product.od_subscription_id}
                                    <br />
                                    Deliver Every: {product.od_subscription_frequency}
                                    <br />
                                    {product.od_active_subscription === 'y' ? (
                                      <button type="button" className="btn btn-primary btn-sm" onClick={() => alert('Cancel subscription for ' + product.od_subscription_id)}>
                                        Cancel Subscription
                                      </button>
                                    ) : (
                                      <span>Subscription has been cancelled.</span>
                                    )}
                                  </>
                                )}
                              </td>
                              <td valign="top">{product.quantity}</td>
                              <td valign="top" align="right">{formatCurrency(product.total)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={4} align="right">Sub Total:</td>
                            <td align="right">{formatCurrency(shipto.subtotal)}</td>
                          </tr>
                          {shipto.gifttotal > 0 && (
                            <tr>
                              <td colSpan={4} align="right">Gift Wrap Total:</td>
                              <td align="right">{formatCurrency(shipto.gifttotal)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={4} align="right">Tax:</td>
                            <td align="right">{formatCurrency(shipto.detail_tax)}</td>
                          </tr>
                          <tr>
                            <td colSpan={4} align="right">Shipping:</td>
                            <td align="right">{formatCurrency(shipto.detail_ship)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>&nbsp;</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Grand Totals */}
          <table className="table table-responsive table-striped cv3-data-table">
            <thead>
              <tr>
                <th colSpan={2}>Grand Totals</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2}>
                  <table width="100%">
                    <tbody>
                      <tr>
                        <td align="right">Sub Total:</td>
                        <td align="right" width="5%">{formatCurrency(order.subtotal)}</td>
                      </tr>
                      {order.discount > 0 || discountAmount > 0 ? (
                        <tr>
                          <td align="right">Promo Discount:</td>
                          <td align="right" width="5%">
                            {order.discount_type === 'f' && order.discount > 0 ? (
                              <>-{formatCurrency(order.discount)}</>
                            ) : order.discount_type === 'p' ? (
                              <>-{order.discount}%</>
                            ) : discountAmount > 0 ? (
                              <>-{formatCurrency(discountAmount)}</>
                            ) : null}
                          </td>
                        </tr>
                      ) : null}
                      {order.gifttotal > 0 && (
                        <tr>
                          <td align="right">Gift Wrap Total:</td>
                          <td align="right" width="5%">{formatCurrency(order.gifttotal)}</td>
                        </tr>
                      )}
                      <tr>
                        <td align="right">Total Tax:</td>
                        <td align="right" width="5%">{formatCurrency(order.total_tax)}</td>
                      </tr>
                      <tr>
                        <td align="right">Total Shipping:</td>
                        <td align="right" width="5%">{formatCurrency(order.total_shipping)}</td>
                      </tr>
                      {order.total_fees > 0 && (
                        <tr>
                          <td align="right">Total Order-Level Fees:</td>
                          <td align="right" width="5%">{formatCurrency(order.total_fees)}</td>
                        </tr>
                      )}
                      <tr>
                        <td align="right"><strong>Grand Total:</strong></td>
                        <td align="right" width="5%"><strong>{formatCurrency(order.total_price)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              {(order.cust_1 || order.cust_2 || order.cust_3) && (
                <>
                  <tr>
                    <td colSpan={2}><b>Custom Fields</b></td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      {order.cust_1 && <div>{order.cust_1}<br /></div>}
                      {order.cust_2 && <div>{order.cust_2}<br /></div>}
                      {order.cust_3 && <div>{order.cust_3}<br /></div>}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back Link */}
      <div style={{ marginTop: '20px' }}>
        <Link href="/dashboard/orders/list" className="btn btn-link">
          <i className="fa fa-arrow-left"></i> Back to Orders
        </Link>
      </div>
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
