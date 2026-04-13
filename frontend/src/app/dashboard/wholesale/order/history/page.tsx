'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface OrderHistory {
  id: string;
  order_id: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function WholesaleOrderHistoryPage() {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale/orders/history');
      setHistory(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="alert alert-info">Loading history...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Order History</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Activity Log ({history.length})</h3>
        </div>
        {history.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link href={`/wholesale/order/detail/${item.order_id}`}>
                        {item.order_id}
                      </Link>
                    </td>
                    <td>
                      <span className="label label-info">{item.action}</span>
                    </td>
                    <td>{item.details}</td>
                    <td>{formatDate(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No history found.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link href="/wholesale/order/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Orders
        </Link>
      </div>
    </div>
  );
}
