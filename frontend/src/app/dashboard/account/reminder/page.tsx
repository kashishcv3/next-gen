'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AccountReminderPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!username.trim()) {
        throw new Error('Please enter a username');
      }

      await api.post('/account/password-reminder', { username });
      setSuccess(true);
      setUsername('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send password reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <br />
      <div className="row">
        <div className="col-lg-12">
          <p>
            <i className="fa fa-info-circle"></i> Log in with your username below and your password hint will be sent
            to the email address given when your account was created.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {success && (
        <div className="alert alert-success">
          Password hint has been sent to your registered email. Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Account Reminder
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <p>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
