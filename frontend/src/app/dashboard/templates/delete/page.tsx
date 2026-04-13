'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!itemId || !confirmed) {
      setError('Please enter ID and confirm');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/templates/${itemId}`);
      router.push('/templates');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Delete Template</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Delete Item</h3>
        </div>
        <div className="panel-body">
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone.
          </div>

          <div className="form-group">
            <label htmlFor="itemId">Item ID</label>
            <input
              type="text"
              className="form-control"
              id="itemId"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
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
            disabled={loading || !itemId || !confirmed}
          >
            Delete
          </button>
          <Link href="/templates" className="btn btn-default" style={{ marginLeft: '10px'}}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
