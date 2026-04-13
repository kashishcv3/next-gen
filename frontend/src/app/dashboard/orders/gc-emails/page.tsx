'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderGCEmailsPage() {
  const [gcCode, setGcCode] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gcCode || !recipientEmail || !senderName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/orders/gc/send-email', {
        gc_code: gcCode,
        recipient_email: recipientEmail,
        sender_name: senderName,
        message: message,
      });

      setSuccess(true);
      setGcCode('');
      setRecipientEmail('');
      setSenderName('');
      setMessage('');
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send gift certificate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Gift Certificate Emails</h1>
      <p className="text-muted">Send gift certificate codes to recipients via email</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Gift certificate email sent successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Send Gift Certificate Email</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSend}>
                <div className="form-group">
                  <label htmlFor="gcCode">Gift Certificate Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="gcCode"
                    value={gcCode}
                    onChange={(e) => setGcCode(e.target.value)}
                    placeholder="e.g., GC-2024-001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recipientEmail">Recipient Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="recipientEmail"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senderName">Sender Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Personal Message</label>
                  <textarea
                    className="form-control"
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Add a personal message (optional)"
                  ></textarea>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i> Sending...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-envelope"></i> Send Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Information</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Gift Certificate Emails:</strong> Send gift certificate codes to your customers or gift recipients.
              </p>
              <hr />
              <p>
                <strong>What Gets Sent:</strong>
              </p>
              <ul>
                <li>Gift certificate code</li>
                <li>Instructions on how to use</li>
                <li>Link to your store</li>
                <li>Personal message (optional)</li>
              </ul>
              <hr />
              <p className="text-muted">
                The recipient will receive an email with all the information needed to redeem the gift certificate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
