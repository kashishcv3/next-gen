'use client';

import React, { useState, useRef } from 'react';
import api from '@/lib/api';

export default function MarketingOptOut2Page() {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOptOut = async () => {
    const emailList = emails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes('@'));

    if (emailList.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await api.post('/marketing/optout/add', {
        emails: emailList,
      });

      setSuccess(true);
      setEmails('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to add opt-out emails:', err);
      setError('Failed to add emails to opt-out list');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append('file', file);

      await api.post('/marketing/optout/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setEmails('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to upload opt-out file:', err);
      setError('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add to Opt-Out List</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Emails added to opt-out list successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          {/* Manual Entry */}
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title">Add Emails Manually</h3>
            </div>
            <div className="panel-body">
              <p className="text-muted">Enter email addresses separated by commas or new lines</p>
              <textarea
                className="form-control"
                rows={8}
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                disabled={loading}
              />
              <p style={{ marginTop: '10px' }} className="text-success">
                Valid emails: {emails.split(/[,\n]/).filter((e) => e.trim() && e.includes('@')).length}
              </p>
              <button
                className="btn btn-primary"
                onClick={handleAddOptOut}
                disabled={loading}
                style={{ marginTop: '10px' }}
              >
                <i className="fa fa-plus"></i> Add to Opt-Out List
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Upload File</h3>
            </div>
            <div className="panel-body">
              <p className="text-muted">Upload a CSV or TXT file with one email per line</p>
              <div className="form-group">
                <input
                  type="file"
                  className="form-control"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Information</h3>
            </div>
            <div className="panel-body">
              <h4>Opt-Out Process</h4>
              <p>Add email addresses to prevent future marketing campaigns from being sent to these recipients.</p>
              <h4>Supported Formats</h4>
              <ul>
                <li>Manual text entry</li>
                <li>CSV files</li>
                <li>TXT files</li>
              </ul>
              <h4>What happens next?</h4>
              <p>Added emails will be immediately blocked from receiving any marketing campaigns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
