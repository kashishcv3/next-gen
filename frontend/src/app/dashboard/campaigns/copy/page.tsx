'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface CampaignToCopy {
  id: string;
  name: string;
  subject: string;
}

export default function CopyCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('id');

  const [campaigns, setCampaigns] = useState<CampaignToCopy[]>([]);
  const [selectedId, setSelectedId] = useState(sourceId || '');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const selected = campaigns.find((c) => c.id === selectedId);
      if (selected) {
        setNewName(`${selected.name} (Copy)`);
      }
    }
  }, [selectedId, campaigns]);

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

  const handleCopy = async () => {
    if (!selectedId) {
      setError('Please select a campaign to copy');
      return;
    }

    if (!newName.trim()) {
      setError('New campaign name is required');
      return;
    }

    try {
      setCopying(true);
      const response = await api.post('/campaigns/copy', {
        source_id: selectedId,
        new_name: newName,
      });
      router.push(`/campaigns/display/${response.data.data.id}`);
    } catch (err) {
      console.error('Failed to copy campaign:', err);
      setError('Failed to copy campaign');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Duplicate Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading campaigns...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Select Campaign to Copy</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="source">Source Campaign</label>
                  <select
                    className="form-control"
                    id="source"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={copying}
                  >
                    <option value="">-- Select a campaign --</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="newName">New Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Campaign copy name"
                    disabled={copying}
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleCopy}
                    disabled={copying || !selectedId || !newName.trim()}
                  >
                    <i className="fa fa-copy"></i> Duplicate Campaign
                  </button>
                  <button
                    className="btn btn-default btn-lg"
                    onClick={() => router.back()}
                    disabled={copying}
                    style={{ marginLeft: '10px' }}
                  >
                    <i className="fa fa-times"></i> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">What Gets Copied?</h3>
              </div>
              <div className="panel-body">
                <ul>
                  <li>Campaign content</li>
                  <li>Subject line</li>
                  <li>From name and email</li>
                  <li>All recipients</li>
                </ul>
                <p style={{ marginTop: '20px', marginBottom: 0 }} className="text-muted">
                  The copied campaign will be created as a new draft campaign with a new name.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
