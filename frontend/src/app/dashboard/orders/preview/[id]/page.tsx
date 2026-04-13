'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

interface OrderPreview {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  created_at: string;
  status: string;
  products: Array<{
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export default function OrderPreviewPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderPreview();
    }
  }, [orderId]);

  const fetchOrderPreview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order preview:', err);
      setError('Failed to load order preview');
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleSkip = () => {
    alert('Order skipped');
  };

  const handleProcess = () => {
    alert('Order processing started');
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading order preview...</div></div>;
  }

  if (error) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-danger">{error}</div></div>;
  }

  if (!order) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-warning">Order not found</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Preview - #{order.order_id}</h1>
      <hr />

      {/* General Info */}
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
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Email:</strong> <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-6">
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
              <h3 className="panel-title">Order Items</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Price</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.sku}</td>
                      <td>{product.product_name}</td>
                      <td style={{ textAlign: 'center' }}>{product.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(product.unit_price)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(product.total_price)}</td>
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
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Order Summary</h3>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#006400' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className="col-md-12">
          <div className="btn-group" role="group">
            <button
              className="btn btn-success btn-lg"
              onClick={handleProcess}
            >
              <i className="fa fa-check"></i> Process Order
            </button>
            <button
              className="btn btn-warning btn-lg"
              onClick={handleSkip}
              style={{ marginLeft: '10px' }}
            >
              <i className="fa fa-forward"></i> Skip Order
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
