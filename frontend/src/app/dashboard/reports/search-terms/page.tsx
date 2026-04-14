'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SearchTermItem {
  search_term: string;
  searches: number;
  results_found: number;
  orders: number;
}

interface Report {
  period: string;
  total_searches: number;
  items: SearchTermItem[];
}

export default function SearchTermsPage() {
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
      const response = await api.get(`/reports/search-terms?period=${period}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch search terms:', err);
      setError('Failed to load search terms report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Search Terms Report</h1>

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
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Popular Search Terms (Total: {report.total_searches})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Search Term</th>
                  <th>Searches</th>
                  <th>Found Results</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.search_term}</td>
                    <td>{item.searches}</td>
                    <td>{item.results_found}</td>
                    <td>{item.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && report && report.items.length === 0 && (
        <div className="alert alert-info">No search term data for the selected period.</div>
      )}
    </div>
  );
}
