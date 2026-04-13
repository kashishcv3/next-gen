'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WholesaleOrderDeletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!orderId || !confirmed) {
      setError('Please enter an ID and confirm deletion');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/wholesale/orders/${orderId}`);
      setOrderId('');
      setConfirmed(false);
      router.push('/wholesale/order/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Order</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Delete Wholesale Order</h3>
        </div>
        <div className="panel-body">
          <div className="alert alert-warning">
            <strong>Warning:</strong> This action cannot be undone.
          </div>

          <div className="form-group">
            <label htmlFor="orderId">Order ID</label>
            <input
              type="text"
              className="form-control"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID"
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
            disabled={loading || !orderId || !confirmed}
          >
            Delete Order
          </button>
          <Link href="/wholesale/order/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
