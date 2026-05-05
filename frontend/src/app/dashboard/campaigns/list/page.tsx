'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  recipients: number;
  created_date: string;
  sent_date?: string;
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async (search?: string, status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await api.get(`/campaigns?${params.toString()}`);
      setCampaigns(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCampaigns(searchTerm, statusFilter);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/campaigns/${id}`);
        fetchCampaigns(searchTerm, statusFilter);
      } catch (err) {
        console.error('Failed to delete campaign:', err);
        setError('Failed to delete campaign');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Email Campaigns</h1>

      {/* Search and Filter Panel */}
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
                  placeholder="Search by name or subject..."
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
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ marginTop: '25px' }}>
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="fa fa-search"></i> Search
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    fetchCampaigns();
                  }}
                  style={{ marginLeft: '5px' }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/campaigns/add" className="btn btn-success" style={{ marginRight: '10px' }}>
            <i className="fa fa-plus"></i> Create Campaign
          </Link>
          <Link href="/campaigns/sent" className="btn btn-info" style={{ marginRight: '10px' }}>
            <i className="fa fa-check"></i> Sent Campaigns
          </Link>
          <Link href="/campaigns/stats" className="btn btn-warning">
            <i className="fa fa-bar-chart"></i> Statistics
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaigns...</div>}

      {!loading && campaigns.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Campaigns ({campaigns.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Created</th>
                  <th>Sent</th>
                  <th style={{ width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.subject}</td>
                    <td>
                      <span className={`label label-${getStatusClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{campaign.recipients}</td>
                    <td>{formatDate(campaign.created_date)}</td>
                    <td>{campaign.sent_date ? formatDate(campaign.sent_date) : '-'}</td>
                    <td>
                      <Link href={`/campaigns/edit/${campaign.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <Link href={`/campaigns/display/${campaign.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-eye"></i> View
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && campaigns.length === 0 && !error && (
        <div className="alert alert-info">No campaigns found. <Link href="/campaigns/add">Create one now</Link></div>
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
