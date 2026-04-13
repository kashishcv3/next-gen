'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  content: string;
  recipients: string[];
  status: string;
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState<Campaign>({
    id: '',
    name: '',
    subject: '',
    from_name: '',
    from_email: '',
    content: '',
    recipients: [],
    status: 'draft',
  });

  const [recipientText, setRecipientText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${campaignId}`);
      const campaign = response.data.data;
      setFormData(campaign);
      setRecipientText(campaign.recipients.join('\n'));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch campaign:', err);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecipientsChange = (text: string) => {
    setRecipientText(text);
    const recipients = text
      .split(/[\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'));
    setFormData((prev) => ({
      ...prev,
      recipients,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/campaigns/${campaignId}`, formData);
      router.push(`/campaigns/display/${campaignId}`);
    } catch (err) {
      console.error('Failed to save campaign:', err);
      setError('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading campaign...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Campaign Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Email Subject</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="from_name">From Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="from_name"
                      name="from_name"
                      value={formData.from_name}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="from_email">From Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="from_email"
                      name="from_email"
                      value={formData.from_email}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">Email Content</label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows={10}
                  value={formData.content}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Recipients</h3>
                </div>
                <div className="panel-body">
                  <textarea
                    className="form-control"
                    rows={6}
                    value={recipientText}
                    onChange={(e) => handleRecipientsChange(e.target.value)}
                    disabled={saving}
                  />
                  <p style={{ marginTop: '10px' }} className="text-success">
                    Valid recipients: {formData.recipients.length}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                  <i className="fa fa-save"></i> Save Changes
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={saving}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Info</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Status:</strong> <span className={`label label-${formData.status === 'draft' ? 'default' : 'success'}`}>{formData.status}</span>
              </p>
              <p>
                <strong>Recipients:</strong> {formData.recipients.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
