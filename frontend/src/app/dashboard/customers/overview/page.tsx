'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface CustomerStats {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  total_groups: number;
  total_members: number;
}

export default function CustomersOverviewPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers/stats');
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load customer statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Customers Overview</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading customer data...</div>}

      {!loading && stats && (
        <>
          {/* Statistics Cards */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-3">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">Total Customers</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.total_customers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">Active</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.active_customers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-warning">
                <div className="panel-heading">
                  <h3 className="panel-title">Inactive</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.inactive_customers}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="panel panel-info">
                <div className="panel-heading">
                  <h3 className="panel-title">Customer Groups</h3>
                </div>
                <div className="panel-body">
                  <h2>{stats.total_groups}</h2>
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
              <Link href="/customers/search" className="btn btn-primary" style={{ marginRight: '10px' }}>
                <i className="fa fa-search"></i> Search Customers
              </Link>
              <Link href="/customers/members/search" className="btn btn-success" style={{ marginRight: '10px' }}>
                <i className="fa fa-users"></i> Manage Members
              </Link>
              <Link href="/customer-groups/list" className="btn btn-info" style={{ marginRight: '10px' }}>
                <i className="fa fa-th"></i> Customer Groups
              </Link>
              <Link href="/customers/export" className="btn btn-warning">
                <i className="fa fa-download"></i> Export Data
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
