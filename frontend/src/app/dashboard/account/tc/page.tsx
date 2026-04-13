'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AccountTcPage() {
  const router = useRouter();
  const [tcContent, setTcContent] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState('');

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const fetchTermsAndConditions = async () => {
    try {
      const response = await api.get('/account/terms-conditions');
      setTcContent(response.data.data?.content || '');
      setAccountType(response.data.data?.account_type || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    if (!agreed) {
      setError('You must agree to the terms and conditions');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/account/accept-terms', {
        type: accountType,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept terms and conditions');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <br />
      <br />
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Terms And Conditions
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <textarea
                    className="form-control"
                    cols={80}
                    rows={20}
                    readOnly
                    value={tcContent}
                  />
                </div>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    {' '}
                    I agree to the terms and conditions given above.
                  </label>
                </div>
              </div>
            </div>

            <input type="hidden" name="type" value={accountType} />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
