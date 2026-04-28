'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Message {
  id: number;
  login_page_message: string;
  main_page_message: string;
  updated_at: string | null;
}

export default function StoreLoginpagemessagesPage() {
  const [message, setMessage] = useState<Message | null>(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stores/loginpagemessages');
        if (response.data.messages && response.data.messages.length > 0) {
          const msg = response.data.messages[0];
          setMessage(msg);
          setLoginMessage(msg.login_page_message);
          setMainMessage(msg.main_page_message);
        }
      } catch (err) {
        setError('Failed to load login page messages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setError(null);

    try {
      await api.post(
        '/stores/loginpagemessages',
        {
          login_page_message: loginMessage,
          main_page_message: mainMessage,
        }
      );
      setSaveSuccess('Messages saved successfully');
    } catch (err) {
      setError('Failed to save messages');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">
        <div className="col-md-10">
          <h1>Login Page Messages</h1>

          {error && <div className="alert alert-danger">{error}</div>}
          {saveSuccess && <div className="alert alert-success">{saveSuccess}</div>}

          {message && (
            <div className="alert alert-info">
              Last updated: {formatDate(message.updated_at)}
            </div>
          )}

          <form onSubmit={handleSave} className="form-horizontal">
            <div className="form-group">
              <label htmlFor="loginMessage" className="col-sm-3 control-label">
                Login Page Message
              </label>
              <div className="col-sm-9">
                <textarea
                  id="loginMessage"
                  className="form-control"
                  rows={6}
                  value={loginMessage}
                  onChange={(e) => setLoginMessage(e.target.value)}
                  placeholder="Enter message to display on login page"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mainMessage" className="col-sm-3 control-label">
                Main Page Message
              </label>
              <div className="col-sm-9">
                <textarea
                  id="mainMessage"
                  className="form-control"
                  rows={6}
                  value={mainMessage}
                  onChange={(e) => setMainMessage(e.target.value)}
                  placeholder="Enter message to display on main admin page"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-3 col-sm-9">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Messages'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
