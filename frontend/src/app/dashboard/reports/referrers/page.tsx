'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReferrerRecord {
  referrer_url: string;
  visits: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
}

interface ReferrersData {
  records: ReferrerRecord[];
}

export default function ReferrersPage() {
  const [data, setData] = useState<ReferrersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/referrers');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load referrer data');
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
          <h1>Referrer Tracking Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Track traffic sources and referrer performance.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading referrer data...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Referrer URL</th>
                      <th className="text-center">Visits</th>
                      <th className="text-center">Orders</th>
                      <th className="text-center">Revenue</th>
                      <th className="text-center">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.referrer_url}</td>
                        <td align="center">{record.visits}</td>
                        <td align="center">{record.orders}</td>
                        <td align="center">${record.revenue.toFixed(2)}</td>
                        <td align="center">{(record.conversion_rate * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
