'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WholesaleShippingDeletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingId, setShippingId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!shippingId || !confirmed) {
      setError('Please enter ID and confirm');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/wholesale/shipping/${shippingId}`);
      router.push('/wholesale/shipping/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete shipping record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Shipping Record</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Delete Shipping Record</h3>
        </div>
        <div className="panel-body">
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone.
          </div>

          <div className="form-group">
            <label htmlFor="shippingId">Shipping Record ID</label>
            <input
              type="text"
              className="form-control"
              id="shippingId"
              value={shippingId}
              onChange={(e) => setShippingId(e.target.value)}
              placeholder="Enter ID"
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
                I confirm deletion
              </label>
            </div>
          </div>

          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={loading || !shippingId || !confirmed}
          >
            Delete
          </button>
          <Link href="/wholesale/shipping/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
