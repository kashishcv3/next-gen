'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Stats {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  total_customers: number;
  total_products: number;
}

export default function StoreQuickStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/store/quick-stats');
      setStats(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Quick Statistics</h1>
          <p><i className="fa fa-info-circle"></i> View quick store statistics.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && stats && (
        <div className="row">
          <div className="col-md-3">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Total Orders</h3>
              </div>
              <div className="panel-body" style={{fontSize: '32px', fontWeight: 'bold', textAlign: 'center'}}>
                {stats.total_orders}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="panel panel-success">
              <div className="panel-heading">
                <h3 className="panel-title">Total Revenue</h3>
              </div>
              <div className="panel-body" style={{fontSize: '32px', fontWeight: 'bold', textAlign: 'center'}}>
                ${stats.total_revenue.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">Avg Order Value</h3>
              </div>
              <div className="panel-body" style={{fontSize: '32px', fontWeight: 'bold', textAlign: 'center'}}>
                ${stats.avg_order_value.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="panel panel-warning">
              <div className="panel-heading">
                <h3 className="panel-title">Customers</h3>
              </div>
              <div className="panel-body" style={{fontSize: '32px', fontWeight: 'bold', textAlign: 'center'}}>
                {stats.total_customers}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
