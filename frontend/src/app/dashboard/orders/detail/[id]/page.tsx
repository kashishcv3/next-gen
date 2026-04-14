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
}

interface OrderDetail {
  order_id: number;
  customer_name: string;
  customer_email: string;
  customer_ip: string;
  total_price: number;
  total_tax: number;
  total_shipping: number;
  status: string;
  date_ordered: string;
  date_updated: string;
  payment_method: string;
  payment_gateway?: string;
  transaction_id?: string;
  billing_address1: string;
  billing_address2?: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  billing_phone?: string;
  shipping_name: string;
  shipping_address1: string;
  shipping_address2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_method?: string;
  items: OrderItem[];
  invalid?: string;
  incomplete?: string;
  tracking?: string;
  comments?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const siteId = searchParams.get('site_id') || '1';

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
      const params = new URLSearchParams();
      params.append('site_id', siteId);

      const response = await api.get<OrderDetail>(`/orders/${orderId}?${params.toString()}`);
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

  const subtotal = order.total_price - order.total_tax - order.total_shipping;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-md-12">
          <h1>Order #{String(order.order_id).padStart(4, '0')}</h1>
          <hr />
        </div>
      </div>

      {/* General Information */}
      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-info-circle"></i> Order Information</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Order ID:</strong> {String(order.order_id).padStart(4, '0')}
                  </p>
                  <p>
                    <strong>Date Ordered:</strong> {order.date_ordered}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`label label-${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </p>
                  <p>
                    <strong>Customer:</strong> {order.customer_name}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>IP Address:</strong> {order.customer_ip}
                  </p>
                  <p>
                    <strong>Payment Method:</strong> {order.payment_method || 'N/A'}
                  </p>
                  {order.transaction_id && (
                    <p>
                      <strong>Transaction ID:</strong> {order.transaction_id}
                    </p>
                  )}
                  {order.tracking && (
                    <p>
                      <strong>Tracking:</strong> {order.tracking}
                    </p>
                  )}
                  {order.date_updated && (
                    <p>
                      <strong>Last Updated:</strong> {order.date_updated}
                    </p>
                  )}
                </div>
              </div>
              {order.comments && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Comments:</strong>
                  <p className="text-muted">{order.comments}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-truck"></i> Shipping Address</h3>
            </div>
            <div className="panel-body">
              <address>
                <strong>{order.shipping_name}</strong>
                <br />
                {order.shipping_address1}
                <br />
                {order.shipping_address2 && (
                  <>
                    {order.shipping_address2}
                    <br />
                  </>
                )}
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                <br />
                {order.shipping_country}
              </address>
              {order.shipping_method && (
                <p>
                  <strong>Method:</strong> {order.shipping_method}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="fa fa-shopping-cart"></i> Order Items ({order.items.length})
              </h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Quantity</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.sku}</td>
                      <td>{item.product_name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Order Totals */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-8"></div>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-calculator"></i> Order Totals</h3>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
              {order.total_tax > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax:</span>
                    <span>{formatCurrency(order.total_tax)}</span>
                  </div>
                </div>
              )}
              {order.total_shipping > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.total_shipping)}</span>
                  </div>
                </div>
              )}
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-credit-card"></i> Billing Address</h3>
            </div>
            <div className="panel-body">
              <address>
                <strong>{order.customer_name}</strong>
                <br />
                {order.billing_address1}
                <br />
                {order.billing_address2 && (
                  <>
                    {order.billing_address2}
                    <br />
                  </>
                )}
                {order.billing_city}, {order.billing_state} {order.billing_zip}
                <br />
                {order.billing_country}
              </address>
              {order.billing_phone && (
                <p>
                  <strong>Phone:</strong> {order.billing_phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="col-md-12">
          <div className="btn-group" role="group">
            <button className="btn btn-default">
              <i className="fa fa-edit"></i> Edit Order
            </button>
            <Link href={`/dashboard/orders/${order.order_id}/print`} className="btn btn-default">
              <i className="fa fa-print"></i> Print
            </Link>
            <button className="btn btn-default">
              <i className="fa fa-envelope"></i> Send Email
            </button>
            <Link href={`/dashboard/orders/export`} className="btn btn-default">
              <i className="fa fa-download"></i> Export
            </Link>
            <button className="btn btn-danger">
              <i className="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="row">
        <div className="col-md-12">
          <Link href="/dashboard/orders/list" className="btn btn-link">
            <i className="fa fa-arrow-left"></i> Back to Orders
          </Link>
        </div>
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
