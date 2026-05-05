'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface WsOrder {
  wsorder_id: number;
  date_ordered: string;
  email: string;
}

export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<WsOrder[]>([]);
  const [count, setCount] = useState(0);
  const [orderList, setOrderList] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wholesale/orders');
      setOrders(res.data.data || []);
      setCount(res.data.count || 0);
      setOrderList(res.data.list || '');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load wholesale orders');
    } finally {
      setLoading(false);
    }
  };

  const handleBatch = async () => {
    if (!orderList) return;
    setError(null); setSuccess(null);
    try {
      await api.post(`/wholesale/orders/batch?order_list=${encodeURIComponent(orderList)}`);
      setSuccess('Orders batched successfully');
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to batch orders');
    }
  };

  const handleReprint = async () => {
    setError(null); setSuccess(null);
    try {
      const res = await api.post('/wholesale/orders/reprint');
      if (res.data.count > 0) {
        setSuccess(`Last batch found: ${res.data.count} orders (${res.data.list})`);
      } else {
        setError('No previous batch found');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve last batch');
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    setError(null);
    try {
      await api.delete(`/wholesale/orders/${orderId}`);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete order');
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return `${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}/${date.getFullYear()}`;
    } catch { return d; }
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Unprocessed Wholesale Orders</h1>
        <p><i className="fa fa-info-circle"></i> Export format: <b>Default</b>. <a href="/dashboard/orders/options">Change</a></p>
      </div></div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>}

      {!loading && count <= 0 && (
        <div>
          <p className="text-center">There were no results for your search</p>
          <p className="text-center">
            <button className="btn btn-primary btn-sm" onClick={handleReprint} style={{marginRight:'5px'}}>
              Re-Print Last Batch
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleReprint}>
              Re-Export Last Batch
            </button>
          </p>
        </div>
      )}

      {!loading && count > 0 && (
        <div>
          {count > 50 && (
            <div style={{marginBottom:'10px'}}>
              <span className="label label-warning">Note</span> You have over 50 orders. Please consider processing a batch.
            </div>
          )}
          <p>
            <button className="btn btn-primary btn-sm" onClick={handleBatch} style={{marginRight:'5px'}}>
              Export Batch
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleReprint} style={{marginRight:'5px'}}>
              Re-Print Last Batch
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleReprint}>
              Re-Export Last Batch
            </button>
          </p>
          <br />
          <div className="well" style={{background:'none'}}>
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th className="text-left"><b>Order ID</b></th>
                    <th className="text-center"><b>Date Ordered</b></th>
                    <th className="text-center"><b>User Email</b></th>
                    <th className="text-center"><b>Delete</b></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.wsorder_id}>
                      <td>
                        <a href={`/dashboard/wholesale/order/detail/${order.wsorder_id}`}>
                          {order.wsorder_id}
                        </a>
                      </td>
                      <td className="text-center">{formatDate(order.date_ordered)}</td>
                      <td className="text-center">{order.email}</td>
                      <td className="text-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(order.wsorder_id); }}
                          title="Delete Order" data-toggle="tooltip">
                          <i className="fa fa-times" style={{color:'red'}}></i>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
