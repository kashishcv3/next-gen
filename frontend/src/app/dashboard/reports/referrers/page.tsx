'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReferrerItem {
  referrer: string;
  visits: number;
  revenue: number;
  orders: number;
}

interface Report {
  period: string;
  total_referrers: number;
  items: ReferrerItem[];
}

export default function ReferrersPage() {
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
      const response = await api.get(`/reports/referrers?period=${period}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch referrers:', err);
      setError('Failed to load referrers report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Referrers Report</h1>

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
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Traffic Sources ({report.total_referrers})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Visits</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.referrer}</td>
                    <td>{item.visits}</td>
                    <td>{item.orders}</td>
                    <td>${item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && report && report.items.length === 0 && (
        <div className="alert alert-info">No referrer data for the selected period.</div>
      )}
    </div>
  );
}
