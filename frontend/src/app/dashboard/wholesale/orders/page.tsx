'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface WholesaleOrder {
  id: string;
  order_number: string;
  member_name: string;
  order_date: string;
  total_amount: number;
  status: string;
}

export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/wholesale/orders');
      setOrders(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wholesale orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Wholesale Orders</h1>
          <p><i className="fa fa-info-circle"></i> View and manage wholesale orders.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-shopping-cart"></i> Wholesale Orders</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Order #</th><th>Member</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{order.member_name}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td>${order.total_amount.toFixed(2)}</td>
                        <td><span className="label label-info">{order.status}</span></td>
                        <td>
                          <Link href={`/dashboard/wholesale/orders/${order.id}`} className="btn btn-xs btn-info"><i className="fa fa-eye"></i></Link>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="text-center">No wholesale orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
