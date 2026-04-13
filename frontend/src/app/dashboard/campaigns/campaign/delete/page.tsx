'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_date: string;
}

export default function CampaignDeletePage() {
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

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Please select a campaign to delete');
      return;
    }

    if (!window.confirm('Are you sure? This action cannot be undone.')) {
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

  const selected = campaigns.find((c) => c.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaigns...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Delete Campaign</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action is permanent and cannot be undone.
                </div>

                <div className="form-group">
                  <label htmlFor="campaign">Select Campaign</label>
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
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Campaign Details</h3>
                    </div>
                    <div className="panel-body">
                      <p>
                        <strong>Name:</strong> {selected.name}
                      </p>
                      <p>
                        <strong>Status:</strong> {selected.status}
                      </p>
                      <p>
                        <strong>Created:</strong> {new Date(selected.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

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
      )}
    </div>
  );
}
