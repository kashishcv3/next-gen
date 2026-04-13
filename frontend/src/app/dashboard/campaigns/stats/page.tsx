'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface CampaignStat {
  id: string;
  name: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/stats');
      setStats(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load campaign statistics');
    } finally {
      setLoading(false);
    }
  };

  const calculateOpenRate = (sent: number, opened: number) => {
    if (sent === 0) return 0;
    return ((opened / sent) * 100).toFixed(2);
  };

  const calculateClickRate = (sent: number, clicked: number) => {
    if (sent === 0) return 0;
    return ((clicked / sent) * 100).toFixed(2);
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Campaign Statistics</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading statistics...</div>}

      {!loading && stats.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Campaign Performance ({stats.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Open Rate</th>
                  <th>Clicked</th>
                  <th>Click Rate</th>
                  <th>Bounced</th>
                  <th>Unsubscribed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.id}>
                    <td>{stat.name}</td>
                    <td>{stat.sent}</td>
                    <td>{stat.opened}</td>
                    <td>{calculateOpenRate(stat.sent, stat.opened)}%</td>
                    <td>{stat.clicked}</td>
                    <td>{calculateClickRate(stat.sent, stat.clicked)}%</td>
                    <td>{stat.bounced}</td>
                    <td>{stat.unsubscribed}</td>
                    <td>
                      <Link href={`/campaigns/campaign-stats/${stat.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-bar-chart"></i> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && stats.length === 0 && !error && (
        <div className="alert alert-info">No campaign statistics available.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/campaigns/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Campaigns
        </Link>
      </div>
    </div>
  );
}
