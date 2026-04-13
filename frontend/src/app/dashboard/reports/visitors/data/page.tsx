'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface VisitorDataRecord {
  date: string;
  visits: number;
  orders: number;
  revenue: number;
}

interface VisitorDetailData {
  records: VisitorDataRecord[];
}

export default function DataPage() {
  const [data, setData] = useState<VisitorDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/visitors/data');
        setData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load visitor data');
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
          <h1>Visitor Data Detail</h1>
          <p>
            <i className="fa fa-info-circle"></i> View detailed visitor analytics data.
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
            <p>Loading visitor data...</p>
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
                      <th className="text-center">Date</th>
                      <th className="text-center">Visits</th>
                      <th className="text-center">Orders</th>
                      <th className="text-center">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td align="center">{record.date}</td>
                        <td align="center">{record.visits}</td>
                        <td align="center">{record.orders}</td>
                        <td align="center">${record.revenue.toFixed(2)}</td>
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
