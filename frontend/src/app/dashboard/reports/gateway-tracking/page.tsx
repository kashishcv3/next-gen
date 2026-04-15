'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function GatewayPageTrackingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/reports/gateway-tracking');
      setData(Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Gateway Page Tracking</h1>
        <p><i className="fa fa-line-chart"></i> View and analyze gateway page tracking metrics and performance</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      <div className="row"><div className="col-lg-12">
        <div className="well well-cv3-table">
          {data.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No tracking data available.</p>
          )}
        </div>
      </div></div>
    </div>
  );
}
