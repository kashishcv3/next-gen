'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

interface OrderProduct {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  created_at: string;
  status: string;
  products: OrderProduct[];
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  notes: string;
  is_subscription: boolean;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductExpand = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading order details...</div></div>;
  }

  if (error) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-danger">{error}</div></div>;
  }

  if (!order) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-warning">Order not found</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-md-12">
          <h1>Order #{order.order_id}</h1>
          <hr />
        </div>
      </div>

      {/* General Information */}
      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Order Information</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Order Date:</strong> {formatDate(order.created_at)}</p>
                  <p><strong>Status:</strong> <span className={`label label-${getStatusClass(order.status)}`}>{order.status}</span></p>
                  <p><strong>Customer Name:</strong> {order.customer_name}</p>
                  <p><strong>Email:</strong> <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a></p>
                </div>
                <div className="col-md-6">
                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                  <p><strong>Subscription:</strong> {order.is_subscription ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</p>
                </div>
              </div>
              {order.notes && (
                <div style={{ marginTop: '15px' }}>
                  <strong>Notes:</strong>
                  <p className="text-muted">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Summary */}
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Shipping Address</h3>
            </div>
            <div className="panel-body">
              <address>
                <strong>{order.shipping_address.name}</strong><br />
                {order.shipping_address.address}<br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
                {order.shipping_address.country}
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Order Items ({order.products.length})</h3>
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
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr>
                        <td>{product.sku}</td>
                        <td>{product.product_name}</td>
                        <td style={{ textAlign: 'center' }}>{product.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(product.unit_price)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(product.total_price)}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-default"
                            onClick={() => toggleProductExpand(product.id)}
                          >
                            <i className={`fa fa-chevron-${expandedProducts.has(product.id) ? 'up' : 'down'}`}></i>
                          </button>
                        </td>
                      </tr>
                      {expandedProducts.has(product.id) && (
                        <tr style={{ backgroundColor: '#f9f9f9' }}>
                          <td colSpan={6}>
                            <div style={{ padding: '10px 0' }}>
                              <strong>Details:</strong>
                              <p style={{ marginBottom: '5px' }}>SKU: {product.sku}</p>
                              <p style={{ marginBottom: '5px' }}>Cost: {formatCurrency(product.unit_price)}</p>
                              <p>Total Cost: {formatCurrency(product.total_price)}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-8"></div>
        <div className="col-md-4">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Order Totals</h3>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
              </div>
              {order.tax > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                </div>
              )}
              {order.shipping > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                </div>
              )}
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      {order.billing_address && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Billing Address</h3>
              </div>
              <div className="panel-body">
                <address>
                  <strong>{order.billing_address.name}</strong><br />
                  {order.billing_address.address}<br />
                  {order.billing_address.city}, {order.billing_address.state} {order.billing_address.zip}<br />
                  {order.billing_address.country}
                </address>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="row" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="col-md-12">
          <div className="btn-group" role="group">
            <button className="btn btn-default">
              <i className="fa fa-edit"></i> Edit Order
            </button>
            <button className="btn btn-default">
              <i className="fa fa-print"></i> Print
            </button>
            <button className="btn btn-default">
              <i className="fa fa-envelope"></i> Send Email
            </button>
            <button className="btn btn-default">
              <i className="fa fa-download"></i> Export
            </button>
            <button className="btn btn-danger">
              <i className="fa fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
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
