'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReportData {
  total_visitors: number;
  total_orders: number;
  total_revenue: string;
  today_visitors: number;
  today_revenue: string;
}

export default function OverviewPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/overview');
        setData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Reports Overview</h1>
          <p>
            <i className="fa fa-info-circle"></i> View your store analytics and reporting dashboard.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading report data...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-3">
            <div className="panel panel-default">
              <div className="panel-heading">Total Visitors</div>
              <div className="panel-body text-center">
                <h2>{data.total_visitors}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="panel panel-default">
              <div className="panel-heading">Total Orders</div>
              <div className="panel-body text-center">
                <h2>{data.total_orders}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="panel panel-default">
              <div className="panel-heading">Total Revenue</div>
              <div className="panel-body text-center">
                <h2>${data.total_revenue}</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="panel panel-default">
              <div className="panel-heading">Today's Visitors</div>
              <div className="panel-body text-center">
                <h2>{data.today_visitors}</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
