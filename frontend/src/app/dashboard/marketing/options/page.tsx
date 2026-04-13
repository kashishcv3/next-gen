'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface MarketingOptions {
  id?: string;
  sender_name: string;
  sender_email: string;
  reply_to: string;
  default_subject: string;
  footer_text: string;
  unsubscribe_enabled: boolean;
  track_opens: boolean;
  track_clicks: boolean;
  max_recipients_per_batch: number;
  batch_delay_seconds: number;
}

export default function MarketingOptionsPage() {
  const [options, setOptions] = useState<MarketingOptions>({
    sender_name: '',
    sender_email: '',
    reply_to: '',
    default_subject: '',
    footer_text: '',
    unsubscribe_enabled: true,
    track_opens: true,
    track_clicks: true,
    max_recipients_per_batch: 100,
    batch_delay_seconds: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/options');
      setOptions(response.data.data || {
        sender_name: '',
        sender_email: '',
        reply_to: '',
        default_subject: '',
        footer_text: '',
        unsubscribe_enabled: true,
        track_opens: true,
        track_clicks: true,
        max_recipients_per_batch: 100,
        batch_delay_seconds: 5,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch options:', err);
      setError('Failed to load marketing options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setOptions((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setOptions((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess(false);
      const response = await api.post('/marketing/options', options);
      setOptions(response.data.data);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to save options:', err);
      setError('Failed to save marketing options');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Marketing Options</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Marketing options saved successfully!</div>}
      {loading && <div className="alert alert-info">Loading options...</div>}

      {!loading && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Email Configuration</h3>
          </div>
          <div className="panel-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="sender_name">Sender Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="sender_name"
                    name="sender_name"
                    value={options.sender_name}
                    onChange={handleChange}
                    placeholder="Your Company Name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="sender_email">Sender Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="sender_email"
                    name="sender_email"
                    value={options.sender_email}
                    onChange={handleChange}
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="reply_to">Reply-To Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="reply_to"
                    name="reply_to"
                    value={options.reply_to}
                    onChange={handleChange}
                    placeholder="support@example.com"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="default_subject">Default Subject Line</label>
                  <input
                    type="text"
                    className="form-control"
                    id="default_subject"
                    name="default_subject"
                    value={options.default_subject}
                    onChange={handleChange}
                    placeholder="Default subject"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="footer_text">Email Footer Text</label>
              <textarea
                className="form-control"
                id="footer_text"
                name="footer_text"
                value={options.footer_text}
                onChange={handleChange}
                rows={4}
                placeholder="Company footer information"
              />
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Tracking Settings</h3>
              </div>
              <div className="panel-body">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="track_opens"
                      checked={options.track_opens}
                      onChange={handleChange}
                    />
                    Track Email Opens
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="track_clicks"
                      checked={options.track_clicks}
                      onChange={handleChange}
                    />
                    Track Link Clicks
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="unsubscribe_enabled"
                      checked={options.unsubscribe_enabled}
                      onChange={handleChange}
                    />
                    Enable Unsubscribe Link
                  </label>
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Batch Settings</h3>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="max_recipients_per_batch">Max Recipients Per Batch</label>
                      <input
                        type="number"
                        className="form-control"
                        id="max_recipients_per_batch"
                        name="max_recipients_per_batch"
                        value={options.max_recipients_per_batch}
                        onChange={handleChange}
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="batch_delay_seconds">Delay Between Batches (seconds)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="batch_delay_seconds"
                        name="batch_delay_seconds"
                        value={options.batch_delay_seconds}
                        onChange={handleChange}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || loading}
              >
                <i className="fa fa-save"></i> Save Options
              </button>
              <button
                className="btn btn-default"
                onClick={fetchOptions}
                disabled={saving || loading}
                style={{ marginLeft: '10px' }}
              >
                <i className="fa fa-undo"></i> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
