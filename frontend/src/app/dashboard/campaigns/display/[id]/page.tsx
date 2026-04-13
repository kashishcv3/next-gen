'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  content: string;
  recipients: number;
  status: string;
  created_date: string;
  sent_date?: string;
}

export default function DisplayCampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${campaignId}`);
      setCampaign(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaign:', err);
      setError('Failed to load campaign');
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
    return <div className="alert alert-info">Loading campaign...</div>;
  }

  if (!campaign) {
    return <div className="alert alert-danger">Campaign not found</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>{campaign.name}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Content</h3>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                {campaign.content}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Details</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Status:</strong> <span className={`label label-${getStatusClass(campaign.status)}`}>{campaign.status}</span>
              </p>
              <p>
                <strong>Subject:</strong> {campaign.subject}
              </p>
              <p>
                <strong>From:</strong> {campaign.from_name} &lt;{campaign.from_email}&gt;
              </p>
              <p>
                <strong>Recipients:</strong> {campaign.recipients}
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

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Actions</h3>
            </div>
            <div className="panel-body">
              {campaign.status === 'draft' && (
                <>
                  <Link href={`/campaigns/edit/${campaign.id}`} className="btn btn-block btn-warning" style={{ marginBottom: '5px' }}>
                    <i className="fa fa-edit"></i> Edit Campaign
                  </Link>
                  <Link href={`/campaigns/send?id=${campaign.id}`} className="btn btn-block btn-success" style={{ marginBottom: '5px' }}>
                    <i className="fa fa-paper-plane"></i> Send Campaign
                  </Link>
                  <Link href={`/campaigns/test?id=${campaign.id}`} className="btn btn-block btn-info" style={{ marginBottom: '5px' }}>
                    <i className="fa fa-flask"></i> Test Campaign
                  </Link>
                  <Link href={`/campaigns/copy?id=${campaign.id}`} className="btn btn-block btn-primary">
                    <i className="fa fa-copy"></i> Duplicate Campaign
                  </Link>
                </>
              )}
              <Link href="/campaigns/list" className="btn btn-block btn-default" style={{ marginTop: '10px' }}>
                <i className="fa fa-arrow-left"></i> Back to List
              </Link>
            </div>
          </div>
        </div>
      </div>
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
