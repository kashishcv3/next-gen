'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface SentCampaign {
  id: string;
  name: string;
  subject: string;
  recipients: number;
  sent_count: number;
  bounce_count: number;
  sent_date: string;
}

export default function SentCampaignsPage() {
  const [campaigns, setCampaigns] = useState<SentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentCampaigns();
  }, []);

  const fetchSentCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns?status=sent');
      setCampaigns(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sent campaigns:', err);
      setError('Failed to load sent campaigns');
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

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Sent Campaigns</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading sent campaigns...</div>}

      {!loading && campaigns.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Sent Campaigns ({campaigns.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Subject</th>
                  <th>Recipients</th>
                  <th>Sent</th>
                  <th>Bounced</th>
                  <th>Send Date</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.subject}</td>
                    <td>{campaign.recipients}</td>
                    <td>{campaign.sent_count}</td>
                    <td>{campaign.bounce_count}</td>
                    <td>{formatDate(campaign.sent_date)}</td>
                    <td>
                      <Link href={`/campaigns/display/${campaign.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-eye"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && campaigns.length === 0 && !error && (
        <div className="alert alert-info">No sent campaigns found.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/campaigns/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Campaigns
        </Link>
      </div>
    </div>
  );
}
