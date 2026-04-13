'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface TestSent {
  id: string;
  campaign_name: string;
  recipient_email: string;
  sent_date: string;
  opened_date?: string;
  clicked_date?: string;
}

export default function TestSentPage() {
  const [items, setItems] = useState<TestSent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestSent();
  }, []);

  const fetchTestSent = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/test-sent');
      setItems(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch test sent:', err);
      setError('Failed to load test sent data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Test Sent Results</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading test results...</div>}

      {!loading && items.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Test Results ({items.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Recipient</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.campaign_name}</td>
                    <td>{item.recipient_email}</td>
                    <td>{formatDate(item.sent_date)}</td>
                    <td>{item.opened_date ? formatDate(item.opened_date) : '-'}</td>
                    <td>{item.clicked_date ? formatDate(item.clicked_date) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="alert alert-info">No test results found.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/campaigns/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Campaigns
        </Link>
      </div>
    </div>
  );
}
