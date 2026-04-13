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
}

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns');
      setCampaigns(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const selected = campaigns.find((c) => c.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Campaign Selection</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaigns...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Select Campaign</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="campaign">Choose a Campaign</label>
                  <select
                    className="form-control"
                    id="campaign"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">-- Select a campaign --</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.status})
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div style={{ marginTop: '20px' }}>
                    <Link href={`/campaigns/display/${selected.id}`} className="btn btn-primary btn-block">
                      <i className="fa fa-eye"></i> View Campaign
                    </Link>
                    <Link href={`/campaigns/edit/${selected.id}`} className="btn btn-warning btn-block" style={{ marginTop: '5px' }}>
                      <i className="fa fa-edit"></i> Edit Campaign
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">Campaign Details</h3>
              </div>
              <div className="panel-body">
                {selected ? (
                  <>
                    <p>
                      <strong>Name:</strong> {selected.name}
                    </p>
                    <p>
                      <strong>Subject:</strong> {selected.subject}
                    </p>
                    <p>
                      <strong>Status:</strong> <span className={`label label-${getStatusClass(selected.status)}`}>{selected.status}</span>
                    </p>
                    <p>
                      <strong>Recipients:</strong> {selected.recipients}
                    </p>
                    <p>
                      <strong>Created:</strong> {formatDate(selected.created_date)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted">Select a campaign to view details</p>
                )}
              </div>
            </div>
          </div>
        </div>
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
