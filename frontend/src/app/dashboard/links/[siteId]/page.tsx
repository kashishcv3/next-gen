'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

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

interface PeriodStats {
  visitors: string;
  orders: string;
  total: string;
  revenue: string;
  shipping: string;
  avg: string;
}

interface Stats {
  status: string;
  orders: number;
  revenue: string;
  ws_orders: number;
  catalogs: number;
  product_reviews: number;
  active: number;
  inactive: number;
  today: PeriodStats;
  yesterday: PeriodStats;
  month?: PeriodStats;
  year?: PeriodStats;
  last_month?: PeriodStats;
  last_year?: PeriodStats;
}

interface Feature {
  title: string;
  description: string;
}

interface LinksData {
  company_info: CompanyInfo;
  exp_date: string;
  stats: Stats;
  new_features: Feature[];
}

export default function LinksPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const { user: currentUser } = useAuth();
  const { setStore } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LinksData | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);
  const [moreStatsLoading, setMoreStatsLoading] = useState(false);
  const [extendedStats, setExtendedStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchLinksData();
  }, [siteId]);

  const fetchLinksData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/mainpage/links/${siteId}`);
      setData(response.data);
      // Populate store context so all other pages get the correct site_id
      if (response.data?.company_info) {
        const ci = response.data.company_info;
        setStore(ci.site_id, ci.name, ci.display_name, ci.is_live);
      }
    } catch (err: any) {
      console.error('Error fetching links:', err);
      setError(err.response?.data?.detail || 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreStats = async () => {
    try {
      setMoreStatsLoading(true);
      const response = await api.get(`/mainpage/links/${siteId}`, {
        params: { all: true },
      });
      setExtendedStats(response.data.stats);
      setShowMoreStats(true);
    } catch (err: any) {
      console.error('Error fetching extended stats:', err);
    } finally {
      setMoreStatsLoading(false);
    }
  };

  const handleMoreStats = () => {
    if (extendedStats) {
      setShowMoreStats(true);
    } else {
      fetchMoreStats();
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info"><i className="fa fa-spinner fa-spin"></i> Loading...</div>
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

  const { company_info: company, stats, new_features, exp_date } = data;
  const hasReportPerms = true; // TODO: check permissions

  // Render a stats row
  const renderStatsRow = (label: string, period: PeriodStats | undefined) => {
    if (!period) return null;
    return (
      <tr>
        <td>{label}</td>
        <td className="text-center">{period.visitors}</td>
        <td className="text-center">{period.orders}</td>
        <td className="text-center">{period.total}</td>
        <td className="text-center">{period.revenue}</td>
        <td className="text-center">{period.shipping}</td>
        <td className="text-center">{period.avg}</td>
      </tr>
    );
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      {/* Dashboard Title */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Dashboard</h1>
          <p>
            <i className="fa fa-info-circle"></i> The Dashboard screen is a summary of some of the key pieces of information regarding your store.
            This is also where we will announce new features and tools as they are added.
          </p>
          {exp_date && (
            <p><span className="label label-warning">Notice</span> This store is currently inactive and will be deleted {exp_date} if it remains inactive. To keep the store active, simply save a change to a product, category or template - the status change will be reflected the following day.</p>
          )}
          <p><span className="label label-danger">Warning</span> Using the admin in multiple tabs or windows of the same browser may result in site errors.</p>
          <br />
        </div>
      </div>

      {/* New Feature Releases */}
      {new_features.length > 0 && (
        <>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowFeatures(!showFeatures)}
          >
            View New Feature Releases&nbsp;&nbsp;
            <span className="badge">{new_features.length}</span>
          </button>
          {showFeatures && (
            <div className="row" style={{ marginTop: '10px' }}>
              <div className="col-lg-12">
                <br />
                <div className="well well-cv3-table">
                  <div className="table-responsive">
                    <table className="table table-hover table-striped tablesorter cv3-data-table">
                      <thead>
                        <tr>
                          <th>New Feature Releases</th>
                        </tr>
                      </thead>
                      <tbody>
                        {new_features.map((feature, idx) => (
                          <tr key={idx}>
                            <td>
                              <Link href={`/dashboard/store/features`}>
                                {feature.title}
                              </Link> - {feature.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Store Maintenance Table */}
      <div className="row">
        <div className="col-lg-12">
          <br />
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table className="table table-hover table-striped tablesorter cv3-data-table">
                <thead>
                  <tr>
                    <th colSpan={2}>Store Maintenance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Live Site Status</td>
                    <td className="text-right">
                      {stats.status.includes('template(s)') ? (
                        <Link href={`/dashboard/templates/list`}>{stats.status}</Link>
                      ) : (
                        stats.status
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Pending Orders</td>
                    <td className="text-right">
                      <Link href={`/dashboard/orders/pending`}>{stats.orders} order(s)</Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Pending Wholesale Orders</td>
                    <td className="text-right">
                      <Link href={`/dashboard/wholesale/orders`}>{stats.ws_orders} order(s)</Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Catalog Requests</td>
                    <td className="text-right">
                      <Link href={`/dashboard/orders/catalog-export`}>{stats.catalogs} request(s)</Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Pending Product Reviews</td>
                    <td className="text-right">
                      <Link href={`/dashboard/products/reviews`}>{stats.product_reviews} review(s)</Link>
                    </td>
                  </tr>
                  <tr>
                    <td>Products</td>
                    <td className="text-right">
                      <Link href={`/dashboard/products/list`}>{stats.active} active, {stats.inactive} inactive</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Table */}
      {hasReportPerms && (
        <div className="row">
          <div className="col-lg-12">
            <br />
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped tablesorter cv3-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Quick Stats</th>
                      <th className="text-center">Visitors</th>
                      <th className="text-center">Orders</th>
                      <th className="text-center">Total Revenue</th>
                      <th className="text-center">Prods/Services</th>
                      <th className="text-center">Shipping/Tax</th>
                      <th className="text-center">Avg. Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Today</td>
                      <td className="text-center">{stats.today.visitors}</td>
                      <td className="text-center">{stats.today.orders}</td>
                      <td className="text-center">{stats.today.total}</td>
                      <td className="text-center">{stats.today.revenue}</td>
                      <td className="text-center">{stats.today.shipping}</td>
                      <td className="text-center">{stats.today.avg}</td>
                    </tr>
                    <tr>
                      <td colSpan={7}>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>Yesterday</td>
                      <td className="text-center">{stats.yesterday.visitors}</td>
                      <td className="text-center">{stats.yesterday.orders}</td>
                      <td className="text-center">{stats.yesterday.total}</td>
                      <td className="text-center">{stats.yesterday.revenue}</td>
                      <td className="text-center">{stats.yesterday.shipping}</td>
                      <td className="text-center">{stats.yesterday.avg}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* More Stats & More Reporting buttons — matches old platform exactly */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleMoreStats}
              disabled={moreStatsLoading}
              style={{ marginRight: '5px' }}
            >
              {moreStatsLoading ? (
                <><i className="fa fa-spinner fa-spin"></i> Loading...</>
              ) : (
                'More Stats'
              )}
            </button>
            <Link href={`/dashboard/reports/overview`} className="btn btn-primary btn-sm">
              More Reporting
            </Link>
          </div>
        </div>
      )}

      {/* More Stats Modal — replaces old platform popup window */}
      {showMoreStats && extendedStats && (
        <div
          className="modal fade in"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            overflow: 'auto',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMoreStats(false);
          }}
        >
          <div
            className="modal-dialog"
            style={{
              maxWidth: '900px',
              margin: '50px auto',
            }}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 className="modal-title">More Stats</h4>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowMoreStats(false)}
                  style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="well well-cv3-table">
                  <div className="table-responsive">
                    <table className="table table-hover table-striped tablesorter cv3-data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '25%' }}>Quick Stats</th>
                          <th className="text-center">Visitors</th>
                          <th className="text-center">Orders</th>
                          <th className="text-center">Total Revenue</th>
                          <th className="text-center">Prods/Services</th>
                          <th className="text-center">Shipping/Tax</th>
                          <th className="text-center">Avg. Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderStatsRow('Today', extendedStats.today)}
                        {renderStatsRow('Month-to-Date', extendedStats.month)}
                        {renderStatsRow('Year-to-Date', extendedStats.year)}
                        <tr>
                          <td colSpan={7}>&nbsp;</td>
                        </tr>
                        {renderStatsRow('Yesterday', extendedStats.yesterday)}
                        {renderStatsRow('Last Month', extendedStats.last_month)}
                        {renderStatsRow('Last Year', extendedStats.last_year)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => setShowMoreStats(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
