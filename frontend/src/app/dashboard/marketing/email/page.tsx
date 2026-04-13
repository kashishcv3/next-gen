'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Email {
  id: string;
  subject: string;
  from_name: string;
  from_email: string;
  recipients_count: number;
  created_date: string;
  status: string;
}

export default function MarketingEmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await api.get(`/marketing/emails?${params.toString()}`);
      setEmails(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError('Failed to load marketing emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEmails(searchTerm);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Email Marketing Templates</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Templates</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-9">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by subject or sender..."
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
                  fetchEmails();
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
      {loading && <div className="alert alert-info">Loading email templates...</div>}

      {!loading && emails.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Email Templates ({emails.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>From</th>
                  <th>Recipients</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email.id}>
                    <td>{email.subject}</td>
                    <td>{email.from_name} &lt;{email.from_email}&gt;</td>
                    <td>{email.recipients_count}</td>
                    <td>{formatDate(email.created_date)}</td>
                    <td>
                      <span className={`label label-${getStatusClass(email.status)}`}>
                        {email.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/marketing/email/${email.id}`} className="btn btn-xs btn-primary">
                        <i className="fa fa-eye"></i> View
                      </Link>
                      <Link href={`/marketing/email/${email.id}/edit`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && emails.length === 0 && !error && (
        <div className="alert alert-info">No email templates found.</div>
      )}
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'default';
    case 'sent':
      return 'success';
    case 'scheduled':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}
