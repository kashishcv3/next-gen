'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CampaignDetail {
  id: string;
  name: string;
  subject: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  created_date: string;
  sent_date?: string;
}

export default function CampaignStatsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignStats();
  }, [campaignId]);

  const fetchCampaignStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${campaignId}/stats`);
      setCampaign(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaign stats:', err);
      setError('Failed to load campaign statistics');
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

  if (loading) {
    return <div className="alert alert-info">Loading statistics...</div>;
  }

  if (!campaign) {
    return <div className="alert alert-danger">Campaign not found</div>;
  }

  const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(2);
  const clickRate = ((campaign.clicked / campaign.sent) * 100).toFixed(2);
  const bounceRate = ((campaign.bounced / campaign.sent) * 100).toFixed(2);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>{campaign.name}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Cards */}
      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-md-3">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">Sent</h3>
            </div>
            <div className="panel-body">
              <h2>{campaign.sent}</h2>
              <p className="text-muted">{campaign.recipients} total recipients</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel panel-success">
            <div className="panel-heading">
              <h3 className="panel-title">Opened</h3>
            </div>
            <div className="panel-body">
              <h2>{campaign.opened}</h2>
              <p className="text-success">{openRate}% open rate</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Clicked</h3>
            </div>
            <div className="panel-body">
              <h2>{campaign.clicked}</h2>
              <p className="text-info">{clickRate}% click rate</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="panel panel-danger">
            <div className="panel-heading">
              <h3 className="panel-title">Issues</h3>
            </div>
            <div className="panel-body">
              <p>Bounced: <strong>{campaign.bounced}</strong> ({bounceRate}%)</p>
              <p>Unsubscribed: <strong>{campaign.unsubscribed}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Details</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Subject:</strong> {campaign.subject}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(campaign.created_date)}
              </p>
              {campaign.sent_date && (
                <p>
                  <strong>Sent:</strong> {formatDate(campaign.sent_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Performance Summary</h3>
            </div>
            <div className="panel-body">
              <div className="progress" style={{ marginBottom: '15px' }}>
                <div className="progress-bar progress-bar-success" style={{ width: `${openRate}%` }}>
                  <span>Open: {openRate}%</span>
                </div>
              </div>
              <div className="progress" style={{ marginBottom: '15px' }}>
                <div className="progress-bar progress-bar-info" style={{ width: `${clickRate}%` }}>
                  <span>Click: {clickRate}%</span>
                </div>
              </div>
              <div className="progress">
                <div className="progress-bar progress-bar-danger" style={{ width: `${bounceRate}%` }}>
                  <span>Bounce: {bounceRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link href="/campaigns/stats" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Stats
        </Link>
      </div>
    </div>
  );
}
