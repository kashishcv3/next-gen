'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MarketingStats {
  total_campaigns: number;
  total_emails: number;
  active_campaigns: number;
  total_contacts: number;
  bounce_rate: number;
  open_rate: number;
  click_rate: number;
}

export default function MarketingOverviewPage() {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/stats');
      setStats(response.data.data || {});
      setError(null);
    } catch (err) {
      console.error('Failed to fetch marketing stats:', err);
      setError('Failed to load marketing statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Marketing Overview</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading marketing data...</div>}

      {!loading && stats && (
        <>
          {/* Statistics Cards */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-3">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">Total Campaigns</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.total_campaigns}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">Active Campaigns</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.active_campaigns}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-info">
                <div className="panel-heading">
                  <h3 className="panel-title">Total Emails Sent</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.total_emails}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-warning">
                <div className="panel-heading">
                  <h3 className="panel-title">Total Contacts</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.total_contacts}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Open Rate</h3>
                </div>
                <div className="panel-body">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-info"
                      style={{ width: `${stats.open_rate}%` }}
                    >
                      {stats.open_rate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Click Rate</h3>
                </div>
                <div className="panel-body">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-success"
                      style={{ width: `${stats.click_rate}%` }}
                    >
                      {stats.click_rate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Bounce Rate</h3>
                </div>
                <div className="panel-body">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-danger"
                      style={{ width: `${stats.bounce_rate}%` }}
                    >
                      {stats.bounce_rate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Quick Actions</h3>
            </div>
            <div className="panel-body">
              <Link href="/marketing/options" className="btn btn-primary" style={{ marginRight: '10px' }}>
                <i className="fa fa-cog"></i> Marketing Options
              </Link>
              <Link href="/marketing/email" className="btn btn-success" style={{ marginRight: '10px' }}>
                <i className="fa fa-envelope"></i> Email Marketing
              </Link>
              <Link href="/marketing/email-blast" className="btn btn-warning" style={{ marginRight: '10px' }}>
                <i className="fa fa-paper-plane"></i> Email Blast
              </Link>
              <Link href="/marketing/export" className="btn btn-info">
                <i className="fa fa-download"></i> Export Data
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
