'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface VisitorData {
  date: string;
  unique_visitors: number;
  page_views: number;
  sessions: number;
}

interface Report {
  period: string;
  total_visitors: number;
  total_sessions: number;
  total_pageviews: number;
  data: VisitorData[];
}

export default function VisitorsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/visitors?period=${period}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch visitors:', err);
      setError('Failed to load visitors report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Visitors Report</h1>

      {/* Period Selection */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div className="btn-group" role="group">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                className={`btn ${period === p ? 'btn-primary' : 'btn-default'}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading report...</div>}

      {!loading && report && (
        <>
          {/* Summary Stats */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Visitors</h4>
                  <h2>{report.total_visitors}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Sessions</h4>
                  <h2>{report.total_sessions}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Page Views</h4>
                  <h2>{report.total_pageviews}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Daily Breakdown</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Unique Visitors</th>
                    <th>Sessions</th>
                    <th>Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((row, index) => (
                    <tr key={index}>
                      <td>{row.date}</td>
                      <td>{row.unique_visitors}</td>
                      <td>{row.sessions}</td>
                      <td>{row.page_views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && report && report.data.length === 0 && (
        <div className="alert alert-info">No visitor data for the selected period.</div>
      )}
    </div>
  );
}
