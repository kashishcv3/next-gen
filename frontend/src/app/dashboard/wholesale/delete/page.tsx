'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WholesaleDeletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wholesaleId, setWholesaleId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!wholesaleId || !confirmed) {
      setError('Please enter an ID and confirm deletion');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/wholesale/${wholesaleId}`);
      setWholesaleId('');
      setConfirmed(false);
      setError(null);
      router.push('/wholesale/list');
    } catch (err) {
      console.error('Failed to delete wholesale:', err);
      setError('Failed to delete wholesale customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Wholesale Customer</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Delete Wholesale Customer</h3>
        </div>
        <div className="panel-body">
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone. Please verify the ID before deleting.
          </div>

          <div className="form-group">
            <label htmlFor="wholesaleId">Wholesale Customer ID</label>
            <input
              type="text"
              className="form-control"
              id="wholesaleId"
              value={wholesaleId}
              onChange={(e) => setWholesaleId(e.target.value)}
              placeholder="Enter the ID of the wholesale customer to delete"
            />
          </div>

          <div className="form-group">
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I understand this action is permanent and cannot be undone
              </label>
            </div>
          </div>

          <div className="form-group">
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading || !wholesaleId || !confirmed}
            >
              <i className="fa fa-trash"></i> {loading ? 'Deleting...' : 'Delete Wholesale Customer'}
            </button>
            <Link href="/wholesale/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
