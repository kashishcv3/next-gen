'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AccountDeletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const account = searchParams.get('account') || '';
  const type = searchParams.get('type') || '';

  const [sure, setSure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, action: string) => {
    e.preventDefault();

    if (action === 'delete' && !sure) {
      setError('You must confirm that you want to delete this account');
      return;
    }

    if (action === 'delete') {
      setLoading(true);
      try {
        await api.post('/account/delete', { account, type });
        router.push('/account/manage');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete account');
        setLoading(false);
      }
    } else {
      router.push('/account/manage');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Delete Account</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Delete Account
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    Are you sure you want to permanently delete the user, <strong>{account}</strong>?
                  </label>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={sure}
                        onChange={(e) => setSure(e.target.checked)}
                      />
                      Yes, I am sure
                    </label>
                  </div>
                  <input type="hidden" name="account" value={account} />
                  <input type="hidden" name="type" value={type} />
                </div>
              </div>
            </div>

            <button
              onClick={(e) => handleSubmit(e as any, 'cancel')}
              className="btn btn-primary"
            >
              Cancel
            </button>
            <button
              onClick={(e) => handleSubmit(e as any, 'delete')}
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
