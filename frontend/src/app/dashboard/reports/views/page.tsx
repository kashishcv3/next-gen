'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PageViewRecord {
  page_url: string;
  views: number;
  unique_visitors: number;
  avg_time_spent: number;
}

interface PageViewsData {
  records: PageViewRecord[];
}

export default function ViewsPage() {
  const [data, setData] = useState<PageViewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/views');
        setData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load page views data');
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
          <h1>Page Views Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Track page views and visitor engagement across your site.
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
            <p>Loading page views data...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Page URL</th>
                      <th className="text-center">Views</th>
                      <th className="text-center">Unique Visitors</th>
                      <th className="text-center">Avg Time Spent (seconds)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.page_url}</td>
                        <td align="center">{record.views}</td>
                        <td align="center">{record.unique_visitors}</td>
                        <td align="center">{record.avg_time_spent.toFixed(2)}</td>
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
