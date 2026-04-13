'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  recipients: number;
}

export default function SendCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id');

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendNow, setSendNow] = useState(true);
  const [scheduleTime, setScheduleTime] = useState('');

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

  const handleSend = async () => {
    if (!campaign) {
      setError('Campaign not found');
      return;
    }

    if (!sendNow && !scheduleTime) {
      setError('Please specify a schedule time');
      return;
    }

    try {
      setSending(true);
      await api.post(`/campaigns/${campaign.id}/send`, {
        send_now: sendNow,
        schedule_time: sendNow ? null : scheduleTime,
      });
      router.push('/campaigns/sent');
    } catch (err) {
      console.error('Failed to send campaign:', err);
      setError('Failed to send campaign');
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
      <h1>Send Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Confirm Send</h3>
            </div>
            <div className="panel-body">
              <div className="panel panel-info" style={{ marginBottom: '20px' }}>
                <div className="panel-heading">
                  <h3 className="panel-title">Campaign Details</h3>
                </div>
                <div className="panel-body">
                  <p>
                    <strong>Name:</strong> {campaign.name}
                  </p>
                  <p>
                    <strong>Subject:</strong> {campaign.subject}
                  </p>
                  <p>
                    <strong>Recipients:</strong> {campaign.recipients}
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Send Options</label>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="sendOption"
                      checked={sendNow}
                      onChange={() => setSendNow(true)}
                      disabled={sending}
                    />
                    Send Immediately
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="sendOption"
                      checked={!sendNow}
                      onChange={() => setSendNow(false)}
                      disabled={sending}
                    />
                    Schedule for Later
                  </label>
                </div>
              </div>

              {!sendNow && (
                <div className="form-group">
                  <label htmlFor="scheduleTime">Schedule Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="scheduleTime"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    disabled={sending}
                  />
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSend}
                  disabled={sending}
                >
                  <i className="fa fa-paper-plane"></i> Send Campaign
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={sending}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-warning">
            <div className="panel-heading">
              <h3 className="panel-title">Important</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>This action will send the campaign to {campaign.recipients} recipients.</strong>
              </p>
              <p>Once sent, this action cannot be undone. Make sure all campaign details are correct.</p>
              <p>Unsubscribed emails will be automatically excluded from this send.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
