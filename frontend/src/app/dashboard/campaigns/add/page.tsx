'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NewCampaign {
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  content: string;
  recipients: string[];
  schedule_time?: string;
  send_immediately: boolean;
}

export default function AddCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewCampaign>({
    name: '',
    subject: '',
    from_name: '',
    from_email: '',
    content: '',
    recipients: [],
    send_immediately: true,
  });

  const [recipientText, setRecipientText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRecipientsChange = (text: string) => {
    setRecipientText(text);
    const recipients = text
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'));
    setFormData((prev) => ({
      ...prev,
      recipients,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!formData.from_email.trim()) {
      setError('From email is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (formData.recipients.length === 0) {
      setError('At least one recipient is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/campaigns', formData);
      router.push(`/campaigns/display/${response.data.data.id}`);
    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Create Campaign</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Campaign Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Campaign Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Awesome Campaign"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Email Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Check out our latest offer!"
                  disabled={loading}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="from_name">From Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="from_name"
                      name="from_name"
                      value={formData.from_name}
                      onChange={handleChange}
                      placeholder="Your Company"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="from_email">From Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      id="from_email"
                      name="from_email"
                      value={formData.from_email}
                      onChange={handleChange}
                      placeholder="noreply@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="content">Email Content *</label>
                <textarea
                  className="form-control"
                  id="content"
                  name="content"
                  rows={10}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter your email content here..."
                  disabled={loading}
                />
              </div>

              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Recipients</h3>
                </div>
                <div className="panel-body">
                  <p className="text-muted">Enter email addresses separated by commas or new lines</p>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={recipientText}
                    onChange={(e) => handleRecipientsChange(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    disabled={loading}
                  />
                  <p style={{ marginTop: '10px' }} className="text-success">
                    Valid recipients: {formData.recipients.length}
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Send Options</label>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="send_immediately"
                      checked={formData.send_immediately}
                      onChange={() => setFormData((prev) => ({ ...prev, send_immediately: true }))}
                      disabled={loading}
                    />
                    Send Immediately
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="send_immediately"
                      checked={!formData.send_immediately}
                      onChange={() => setFormData((prev) => ({ ...prev, send_immediately: false }))}
                      disabled={loading}
                    />
                    Schedule for Later
                  </label>
                </div>
                {!formData.send_immediately && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="schedule_time"
                      value={formData.schedule_time || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <i className="fa fa-save"></i> Create Campaign
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={loading}
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
              <h3 className="panel-title">Preview</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>From:</strong> {formData.from_name || 'Not set'}
              </p>
              <p>
                <strong>Subject:</strong> {formData.subject || 'Not set'}
              </p>
              <p>
                <strong>Recipients:</strong> {formData.recipients.length}
              </p>
              <hr />
              <div style={{ maxHeight: '300px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px' }}>
                {formData.content || 'Content preview will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
