'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface CampaignEmail {
  id: string;
  campaign_name: string;
  recipient_email: string;
  status: string;
  sent_date?: string;
  opened_date?: string;
  clicked_date?: string;
}

export default function CampaignEmailPage() {
  const [emails, setEmails] = useState<CampaignEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await api.get(`/campaigns/emails?${params.toString()}`);
      setEmails(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaign emails:', err);
      setError('Failed to load campaign emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEmails(searchTerm, statusFilter);
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
      <h1>Campaign Emails</h1>

      {/* Search and Filter */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search & Filter</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  placeholder="Search by campaign or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="sent">Sent</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ marginTop: '25px' }}>
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="fa fa-search"></i> Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaign emails...</div>}

      {!loading && emails.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Campaign Emails ({emails.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Recipient Email</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email.id}>
                    <td>{email.campaign_name}</td>
                    <td>{email.recipient_email}</td>
                    <td>
                      <span className={`label label-${getStatusClass(email.status)}`}>{email.status}</span>
                    </td>
                    <td>{email.sent_date ? formatDate(email.sent_date) : '-'}</td>
                    <td>{email.opened_date ? formatDate(email.opened_date) : '-'}</td>
                    <td>{email.clicked_date ? formatDate(email.clicked_date) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && emails.length === 0 && !error && (
        <div className="alert alert-info">No campaign emails found.</div>
      )}
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'sent':
      return 'success';
    case 'opened':
      return 'info';
    case 'clicked':
      return 'primary';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}
