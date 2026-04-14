'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CompanyInfo {
  site_id: number;
  name: string;
  display_name: string;
  is_live: string;
  domain: string;
  secure_domain: string;
  in_cloud: string;
  admin_host: string;
  date_created: string;
  bill: string;
  bill_note: string;
  uid?: number;
}

interface Stats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  revenue: number;
}

interface LinksData {
  company_info: CompanyInfo;
  stats: Stats;
}

export default function LinksPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LinksData | null>(null);

  useEffect(() => {
    fetchLinksData();
  }, [siteId]);

  const fetchLinksData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/mainpage/links/${siteId}`);
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching links:', err);
      setError(err.response?.data?.detail || 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-warning">No data available</div>
      </div>
    );
  }

  const company = data.company_info;
  const isLive = company.is_live === 'y';

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>{company.name}</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        {company.display_name}
      </p>

      {/* Store Status Section */}
      <div className="well" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>Store Status</h3>
        <div className="row">
          <div className="col-sm-6">
            <p>
              <strong>Status:</strong>{' '}
              <span className={`label ${isLive ? 'label-success' : 'label-default'}`}>
                {isLive ? 'Live' : 'Development'}
              </span>
            </p>
            <p>
              <strong>Primary Domain:</strong>{' '}
              {company.domain ? (
                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                  {company.domain}
                </a>
              ) : (
                'Not configured'
              )}
            </p>
            <p>
              <strong>Secure Domain:</strong>{' '}
              {company.secure_domain ? (
                <a href={`https://${company.secure_domain}`} target="_blank" rel="noopener noreferrer">
                  {company.secure_domain}
                </a>
              ) : (
                'Not configured'
              )}
            </p>
          </div>
          <div className="col-sm-6">
            <p>
              <strong>Created:</strong> {company.date_created}
            </p>
            <p>
              <strong>Cloud Hosting:</strong> {company.in_cloud === 'y' ? 'Yes' : 'No'}
            </p>
            {company.admin_host && (
              <p>
                <strong>Admin Host:</strong> {company.admin_host}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="panel panel-default" style={{ marginBottom: '30px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Quick Stats</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-sm-3">
              <div className="text-center">
                <h4 style={{ marginTop: 0 }}>{data.stats.total_products}</h4>
                <p>Products</p>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="text-center">
                <h4 style={{ marginTop: 0 }}>{data.stats.total_customers}</h4>
                <p>Customers</p>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="text-center">
                <h4 style={{ marginTop: 0 }}>{data.stats.total_orders}</h4>
                <p>Orders</p>
              </div>
            </div>
            <div className="col-sm-3">
              <div className="text-center">
                <h4 style={{ marginTop: 0 }}>${data.stats.revenue}</h4>
                <p>Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Management Links */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Store Management</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-sm-6">
              <ul className="list-unstyled">
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/dashboard/products/list`} className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-th-list"></span> Products
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/dashboard/customers/members`} className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-user"></span> Customers
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/dashboard/settings/general`} className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-cog"></span> Settings
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-sm-6">
              <ul className="list-unstyled">
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/dashboard/orders`} className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-shopping-cart"></span> Orders
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href={`/dashboard/reports`} className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-bar-chart"></span> Reports
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <a href={company.domain ? `https://${company.domain}` : '#'} target="_blank" rel="noopener noreferrer" className="btn btn-default btn-sm">
                    <span className="glyphicon glyphicon-share-alt"></span> View Store
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Developer */}
      <div style={{ marginTop: '30px' }}>
        {company.uid && (
          <Link href={`/dashboard/mainpage/${company.uid}`} className="btn btn-secondary">
            Back to Developer
          </Link>
        )}
      </div>
    </div>
  );
}
