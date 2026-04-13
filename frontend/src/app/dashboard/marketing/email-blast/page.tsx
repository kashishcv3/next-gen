'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface EmailBlastRequest {
  email_template_id?: string;
  subject: string;
  from_name: string;
  from_email: string;
  recipients: string[];
  send_immediately: boolean;
  schedule_time?: string;
  personalize: boolean;
}

export default function EmailBlastPage() {
  const [formData, setFormData] = useState<EmailBlastRequest>({
    subject: '',
    from_name: '',
    from_email: '',
    recipients: [],
    send_immediately: true,
    schedule_time: '',
    personalize: false,
  });

  const [recipientText, setRecipientText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSend = async () => {
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!formData.from_email.trim()) {
      setError('From email is required');
      return;
    }
    if (formData.recipients.length === 0) {
      setError('At least one recipient is required');
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);
      await api.post('/marketing/email-blast', formData);
      setSuccess(true);
      setError(null);
      setFormData({
        subject: '',
        from_name: '',
        from_email: '',
        recipients: [],
        send_immediately: true,
        schedule_time: '',
        personalize: false,
      });
      setRecipientText('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to send email blast:', err);
      setError('Failed to send email blast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Email Blast</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Email blast sent successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Compose Email Blast</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="from_name">From Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="from_name"
                  name="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  placeholder="Your Company Name"
                  disabled={loading}
                />
              </div>

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

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Email subject line"
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

              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="personalize"
                    checked={formData.personalize}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  Personalize Email (use recipient variables)
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
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
                      value={formData.schedule_time}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSend}
                  disabled={loading || formData.recipients.length === 0}
                >
                  <i className="fa fa-paper-plane"></i> Send Blast
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => {
                    setFormData({
                      subject: '',
                      from_name: '',
                      from_email: '',
                      recipients: [],
                      send_immediately: true,
                      schedule_time: '',
                      personalize: false,
                    });
                    setRecipientText('');
                    setError(null);
                  }
                  disabled={loading}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-undo"></i> Clear
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
              <p>
                <strong>Send:</strong> {formData.send_immediately ? 'Immediately' : 'Scheduled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
