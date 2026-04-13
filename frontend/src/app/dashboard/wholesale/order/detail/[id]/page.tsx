'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface OrderDetail {
  id: string;
  order_id: string;
  wholesale_id: string;
  total: number;
  status: string;
  items: any[];
  created_at: string;
  updated_at: string;
}

export default function WholesaleOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wholesale/orders/${id}`);
      setOrder(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
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

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error || !order) return <div className="alert alert-danger">{error || 'Order not found'}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order #{order.order_id}</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Order Information</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <table className="table table-condensed">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '150px' }}>Order ID:</td>
                    <td>{order.order_id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Status:</td>
                    <td>
                      <span className={`label label-${order.status === 'completed' ? 'success' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Total:</td>
                    <td>{formatCurrency(order.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <table className="table table-condensed">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '150px' }}>Created:</td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Updated:</td>
                    <td>{formatDate(order.updated_at)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Order Items</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/wholesale/order/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Orders
        </Link>
      </div>
    </div>
  );
}
