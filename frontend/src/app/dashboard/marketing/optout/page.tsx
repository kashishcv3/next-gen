'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface OptOutEmail {
  id: string;
  email: string;
  reason: string;
  opt_out_date: string;
  status: string;
}

export default function MarketingOptOutPage() {
  const [emails, setEmails] = useState<OptOutEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOptOutEmails();
  }, []);

  const fetchOptOutEmails = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await api.get(`/marketing/optout?${params.toString()}`);
      setEmails(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch opt-out emails:', err);
      setError('Failed to load opt-out list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchOptOutEmails(searchTerm);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map((e) => e.id)));
    }
  };

  const handleSelectEmail = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleReactivate = async () => {
    if (selectedEmails.size === 0) {
      setError('Please select emails to reactivate');
      return;
    }

    try {
      await api.post('/marketing/optout/reactivate', {
        email_ids: Array.from(selectedEmails),
      });
      setSelectedEmails(new Set());
      fetchOptOutEmails(searchTerm);
    } catch (err) {
      console.error('Failed to reactivate emails:', err);
      setError('Failed to reactivate emails');
    }
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
      <h1>Opt-Out Management</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Opt-Out List</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-9">
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Search by email address..."
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
                  fetchOptOutEmails();
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
      {loading && <div className="alert alert-info">Loading opt-out list...</div>}

      {!loading && emails.length > 0 && (
        <>
          {/* Bulk Actions */}
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-body">
              <button
                className="btn btn-warning"
                onClick={handleReactivate}
                disabled={selectedEmails.size === 0}
              >
                <i className="fa fa-refresh"></i> Reactivate Selected
              </button>
              <span style={{ marginLeft: '20px', fontSize: '14px' }}>
                {selectedEmails.size} of {emails.length} selected
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Opt-Out List ({emails.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={selectedEmails.size === emails.length && emails.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Email Address</th>
                    <th>Reason</th>
                    <th>Opt-Out Date</th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr key={email.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(email.id)}
                          onChange={() => handleSelectEmail(email.id)}
                        />
                      </td>
                      <td>{email.email}</td>
                      <td>{email.reason}</td>
                      <td>{formatDate(email.opt_out_date)}</td>
                      <td>
                        <span className={`label label-${getStatusClass(email.status)}`}>
                          {email.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleReactivate()}
                        >
                          <i className="fa fa-refresh"></i> Reactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && emails.length === 0 && !error && (
        <div className="alert alert-info">No opt-out records found.</div>
      )}
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'danger';
    case 'inactive':
      return 'success';
    default:
      return 'default';
  }
}
