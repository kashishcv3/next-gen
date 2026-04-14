'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

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
  tracking?: string;
  comments?: string;
}

export default function OrderPrintPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
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
      setError('Failed to load order details for printing');
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">
          <i className="fa fa-spinner fa-spin"></i> Loading order for printing...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle"></i> {error || 'Order not found'}
        </div>
        <Link href="/dashboard/orders/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Orders
        </Link>
      </div>
    );
  }

  const subtotal = order.total_price - order.total_tax - order.total_shipping;

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .container-fluid {
            padding: 0;
          }
        }
      `}</style>

      <div className="container-fluid" style={{ padding: '20px' }}>
        {/* Print Controls - Hidden in Print */}
        <div className="no-print" style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="fa fa-print"></i> Print
          </button>
          <Link href={`/dashboard/orders/${orderId}`} className="btn btn-default" style={{ marginLeft: '5px' }}>
            <i className="fa fa-arrow-left"></i> Back to Order
          </Link>
        </div>

        {/* Print Content */}
        <div style={{ border: '1px solid #ddd', padding: '20px', backgroundColor: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2>ORDER INVOICE</h2>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              Order #: {String(order.order_id).padStart(4, '0')}
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              Date: {order.date_ordered}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Billing Address */}
              <div>
                <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
                  BILL TO:
                </h4>
                <p style={{ margin: '5px 0' }}>
                  <strong>{order.customer_name}</strong>
                </p>
                <p style={{ margin: '5px 0' }}>{order.billing_address1}</p>
                {order.billing_address2 && (
                  <p style={{ margin: '5px 0' }}>{order.billing_address2}</p>
                )}
                <p style={{ margin: '5px 0' }}>
                  {order.billing_city}, {order.billing_state} {order.billing_zip}
                </p>
                <p style={{ margin: '5px 0' }}>{order.billing_country}</p>
                {order.billing_phone && (
                  <p style={{ margin: '5px 0' }}>{order.billing_phone}</p>
                )}
                <p style={{ margin: '5px 0' }}>{order.customer_email}</p>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
                  SHIP TO:
                </h4>
                <p style={{ margin: '5px 0' }}>
                  <strong>{order.shipping_name}</strong>
                </p>
                <p style={{ margin: '5px 0' }}>{order.shipping_address1}</p>
                {order.shipping_address2 && (
                  <p style={{ margin: '5px 0' }}>{order.shipping_address2}</p>
                )}
                <p style={{ margin: '5px 0' }}>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                </p>
                <p style={{ margin: '5px 0' }}>{order.shipping_country}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '10px 0' }}>SKU</th>
                  <th style={{ textAlign: 'left', padding: '10px 0' }}>Product</th>
                  <th style={{ textAlign: 'center', padding: '10px 0' }}>QTY</th>
                  <th style={{ textAlign: 'right', padding: '10px 0' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px 0' }}>{item.sku}</td>
                    <td style={{ padding: '10px 0' }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center', padding: '10px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}>{formatCurrency(item.unit_price)}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '20px', justifyContent: 'end' }}>
              <div style={{ fontWeight: 'normal' }}>Subtotal:</div>
              <div>{formatCurrency(subtotal)}</div>
              {order.total_tax > 0 && (
                <>
                  <div style={{ fontWeight: 'normal' }}>Tax:</div>
                  <div>{formatCurrency(order.total_tax)}</div>
                </>
              )}
              {order.total_shipping > 0 && (
                <>
                  <div style={{ fontWeight: 'normal' }}>Shipping:</div>
                  <div>{formatCurrency(order.total_shipping)}</div>
                </>
              )}
              <div style={{ borderTop: '2px solid #333', paddingTop: '10px', fontWeight: 'bold' }}>
                TOTAL:
              </div>
              <div style={{ borderTop: '2px solid #333', paddingTop: '10px', fontWeight: 'bold' }}>
                {formatCurrency(order.total_price)}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ marginBottom: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Payment Method:</strong> {order.payment_method}
            </p>
            {order.tracking && (
              <p style={{ margin: '5px 0' }}>
                <strong>Tracking:</strong> {order.tracking}
              </p>
            )}
            {order.shipping_method && (
              <p style={{ margin: '5px 0' }}>
                <strong>Shipping Method:</strong> {order.shipping_method}
              </p>
            )}
          </div>

          {/* Comments */}
          {order.comments && (
            <div style={{ marginBottom: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <strong>Comments:</strong>
              <p style={{ margin: '10px 0' }}>{order.comments}</p>
            </div>
          )}

          <div style={{ textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px', fontSize: '12px', color: '#666' }}>
            <p>Thank you for your order!</p>
          </div>
        </div>
      </div>
    </>
  );
}
