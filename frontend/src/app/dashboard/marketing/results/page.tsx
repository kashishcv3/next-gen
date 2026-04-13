'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CampaignResult {
  id: string;
  campaign_name: string;
  email_sent: number;
  email_opened: number;
  email_clicked: number;
  unsubscribe_count: number;
  bounce_count: number;
  created_date: string;
}

export default function MarketingResultsPage() {
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await api.get(`/marketing/results?${params.toString()}`);
      setResults(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError('Failed to load campaign results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchResults(searchTerm);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
      <h1>Campaign Results</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Results</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-9">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by campaign name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                <i className="fa fa-search"></i> Search
              </button>
              <button
                className="btn btn-default"
                onClick={() => {
                  setSearchTerm('');
                  fetchResults();
                }
                style={{ marginLeft: '5px' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading results...</div>}

      {!loading && results.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Campaign Results ({results.length})</h3>
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
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.campaign_name}</td>
                    <td>{result.email_sent}</td>
                    <td>{result.email_opened}</td>
                    <td>{calculateOpenRate(result.email_sent, result.email_opened)}%</td>
                    <td>{result.email_clicked}</td>
                    <td>{calculateClickRate(result.email_sent, result.email_clicked)}%</td>
                    <td>{result.bounce_count}</td>
                    <td>{result.unsubscribe_count}</td>
                    <td>{formatDate(result.created_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="alert alert-info">No campaign results found.</div>
      )}
    </div>
  );
}
