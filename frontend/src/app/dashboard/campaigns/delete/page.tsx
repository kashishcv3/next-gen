'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  created_date: string;
}

export default function DeleteCampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns?status=draft');
      setCampaigns(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Please select a campaign to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/campaigns/${selectedId}`);
      router.push('/campaigns/list');
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      setError('Failed to delete campaign');
    } finally {
      setDeleting(false);
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
      <h1>Delete Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaigns...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-8">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Delete Campaign</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> Deleting a campaign is permanent and cannot be undone.
                </div>

                <div className="form-group">
                  <label htmlFor="campaign">Select Campaign to Delete</label>
                  <select
                    className="form-control"
                    id="campaign"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={deleting}
                  >
                    <option value="">-- Select a campaign --</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name} ({campaign.status})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedId && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Campaign Details</h3>
                    </div>
                    <div className="panel-body">
                      {campaigns.map((campaign) =>
                        campaign.id === selectedId ? (
                          <div key={campaign.id}>
                            <p>
                              <strong>Name:</strong> {campaign.name}
                            </p>
                            <p>
                              <strong>Subject:</strong> {campaign.subject}
                            </p>
                            <p>
                              <strong>Status:</strong> <span className="label label-default">{campaign.status}</span>
                            </p>
                            <p>
                              <strong>Created:</strong> {formatDate(campaign.created_date)}
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={handleDelete}
                    disabled={deleting || !selectedId}
                  >
                    <i className="fa fa-trash"></i> Delete Campaign
                  </button>
                  <Link href="/campaigns/list" className="btn btn-default btn-lg" style={{ marginLeft: '10px' }}>
                    <i className="fa fa-times"></i> Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">Information</h3>
              </div>
              <div className="panel-body">
                <p>Only draft campaigns can be deleted.</p>
                <p>Sent or scheduled campaigns must be archived instead.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
