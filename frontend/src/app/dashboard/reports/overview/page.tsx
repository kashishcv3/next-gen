'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Overview {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  average_order_value: number;
  period: string;
}

export default function ReportsOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/overview?period=${period}`);
      setOverview(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Reports & Analytics</h1>

      {/* Period Selection */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Select Period</h3>
        </div>
        <div className="panel-body">
          <div className="btn-group" role="group">
            <button
              className={`btn ${period === 'day' ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setPeriod('day')}
            >
              Daily
            </button>
            <button
              className={`btn ${period === 'week' ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setPeriod('week')}
            >
              Weekly
            </button>
            <button
              className={`btn ${period === 'month' ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setPeriod('month')}
            >
              Monthly
            </button>
            <button
              className={`btn ${period === 'year' ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setPeriod('year')}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading reports...</div>}

      {!loading && overview && (
        <>
          {/* Overview Stats */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-shopping-cart"></i> Total Orders
                  </h4>
                </div>
                <div className="panel-body">
                  <h2>{overview.total_orders}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-dollar"></i> Total Revenue
                  </h4>
                </div>
                <div className="panel-body">
                  <h2>${overview.total_revenue.toFixed(2)}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-users"></i> Total Customers
                  </h4>
                </div>
                <div className="panel-body">
                  <h2>{overview.total_customers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-chart-bar"></i> Avg Order Value
                  </h4>
                </div>
                <div className="panel-body">
                  <h2>${overview.average_order_value.toFixed(2)}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Available Reports */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Available Reports</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/salesrank" className="btn btn-block btn-default">
                    <i className="fa fa-bar-chart"></i><br />
                    Sales Rank
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Top selling products</p>
                </div>
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/visitors" className="btn btn-block btn-default">
                    <i className="fa fa-eye"></i><br />
                    Visitors
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Site traffic analysis</p>
                </div>
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/referrers" className="btn btn-block btn-default">
                    <i className="fa fa-link"></i><br />
                    Referrers
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Traffic sources</p>
                </div>
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/search-terms" className="btn btn-block btn-default">
                    <i className="fa fa-search"></i><br />
                    Search Terms
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Popular searches</p>
                </div>
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/cart-abandonment" className="btn btn-block btn-default">
                    <i className="fa fa-shopping-cart"></i><br />
                    Cart Abandonment
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Lost sales recovery</p>
                </div>
                <div className="col-md-4" style={{ marginBottom: '20px' }}>
                  <Link href="/dashboard/reports/gift-cards" className="btn btn-block btn-default">
                    <i className="fa fa-gift"></i><br />
                    Gift Certificates
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Gift card activity</p>
                </div>
                <div className="col-md-4">
                  <Link href="/dashboard/reports/inventory-notify" className="btn btn-block btn-default">
                    <i className="fa fa-bell"></i><br />
                    Inventory Notify
                  </Link>
                  <p style={{ marginTop: '10px', fontSize: '12px' }}>Restock requests</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
