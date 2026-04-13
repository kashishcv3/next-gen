'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function TestCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [testEmails, setTestEmails] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
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

  const handleSendTest = async () => {
    const emails = testEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emails.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    try {
      setSending(true);
      await api.post(`/campaigns/${campaignId}/test-send`, {
        test_emails: emails,
      });
      setSuccess(true);
      setTestEmails('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to send test:', err);
      setError('Failed to send test email');
    } finally {
      setSending(false);
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
      <h1>Test Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Test email sent successfully!</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Send Test Email</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="testEmails">Test Email Address(es)</label>
                <textarea
                  className="form-control"
                  id="testEmails"
                  rows={4}
                  value={testEmails}
                  onChange={(e) => setTestEmails(e.target.value)}
                  placeholder="test@example.com&#10;test2@example.com"
                  disabled={sending}
                />
                <p className="text-muted" style={{ marginTop: '10px' }}>
                  Enter email addresses separated by commas or new lines
                </p>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleSendTest}
                disabled={sending || testEmails.trim().length === 0}
              >
                <i className="fa fa-flask"></i> Send Test
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Preview</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Campaign:</strong> {campaign.name}
              </p>
              <p>
                <strong>Subject:</strong> {campaign.subject}
              </p>
              <hr />
              <p style={{ fontSize: '12px' }} className="text-muted">
                Preview:
              </p>
              <div style={{ maxHeight: '250px', overflow: 'auto', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ddd' }}>
                {campaign.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
