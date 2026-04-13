'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AccountConfirmCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!code.trim()) {
        throw new Error('Please enter a confirmation code');
      }

      await api.post('/account/confirm-code', { code });
      router.push('/account/reset');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to confirm code');
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
            <i className="fa fa-info-circle"></i> We've sent a password reset code to your registered email address.
            Enter the confirmation code to reset your password. If you did not receive an email, please verify you have
            entered a valid username.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Confirm Code
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enter confirmation code here</label>
                  <input
                    type="text"
                    className="form-control"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
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
