'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CartItem {
  cart_id: number;
  customer_email: string;
  cart_value: number;
  items_count: number;
  abandoned_date: string;
  recovered: boolean;
}

interface Report {
  period: string;
  total_abandoned: number;
  total_value: number;
  items: CartItem[];
}

export default function CartAbandonmentPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/cart-abandonment?period=${period}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cart abandonment:', err);
      setError('Failed to load cart abandonment report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Cart Abandonment Report</h1>

      {/* Period Selection */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div className="btn-group" role="group">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                className={`btn ${period === p ? 'btn-primary' : 'btn-default'}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading report...</div>}

      {!loading && report && (
        <>
          {/* Summary Stats */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-6">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Abandoned Carts</h4>
                  <h2>{report.total_abandoned}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Abandoned Value</h4>
                  <h2>${report.total_value.toFixed(2)}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Abandoned Carts</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Cart Value</th>
                    <th>Items</th>
                    <th>Abandoned Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item) => (
                    <tr key={item.cart_id}>
                      <td>{item.customer_email}</td>
                      <td>${item.cart_value.toFixed(2)}</td>
                      <td>{item.items_count}</td>
                      <td>{new Date(item.abandoned_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`label label-${item.recovered ? 'success' : 'warning'}`}>
                          {item.recovered ? 'Recovered' : 'Abandoned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && report && report.items.length === 0 && (
        <div className="alert alert-info">No abandoned carts for the selected period.</div>
      )}
    </div>
  );
}
