'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface TestEmail {
  id: string;
  campaign_name: string;
  recipient_email: string;
  sent_date: string;
  status: string;
}

export default function TestListPage() {
  const [tests, setTests] = useState<TestEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestEmails();
  }, []);

  const fetchTestEmails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/test-emails');
      setTests(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch test emails:', err);
      setError('Failed to load test emails');
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
      <h1>Test Email List</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading test emails...</div>}

      {!loading && tests.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Test Emails ({tests.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Sent Date</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.campaign_name}</td>
                    <td>{test.recipient_email}</td>
                    <td>
                      <span className={`label label-${test.status === 'sent' ? 'success' : 'default'}`}>{test.status}</span>
                    </td>
                    <td>{formatDate(test.sent_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tests.length === 0 && !error && (
        <div className="alert alert-info">No test emails found.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/campaigns/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Campaigns
        </Link>
      </div>
    </div>
  );
}
