'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminMessagesPage() {
  const [loginMessage, setLoginMessage] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/stores/loginpagemessages');
      setLoginMessage(res.data.login_page_message || '');
      setMainMessage(res.data.main_page_message || '');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/stores/loginpagemessages', {
        login_page_message: loginMessage,
        main_page_message: mainMessage,
      });
      setSuccess('Messages saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save messages');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Admin Messages</h1>
          <p>
            <i className="fa fa-info-circle"></i> To set a login or mainpage message for the CV3 admin, fill in the appropriate textareas below.
          </p>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSubmit}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Admin Messages</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Admin Login Message</label>
                  <textarea
                    className="form-control"
                    rows={10}
                    value={loginMessage}
                    onChange={(e) => setLoginMessage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Main Page Message</label>
                  <textarea
                    className="form-control"
                    rows={10}
                    value={mainMessage}
                    onChange={(e) => setMainMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-save"></i> Save Messages
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
