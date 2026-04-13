'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DeleteRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ruleId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!ruleId) {
      setError('Invalid rule ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/customer-groups/rules/${ruleId}`);
      router.back();
    } catch (err) {
      console.error('Failed to delete rule:', err);
      setError('Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Rule</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Confirm Deletion</h3>
        </div>
        <div className="panel-body">
          <p>Are you sure you want to delete this rule? This action cannot be undone.</p>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            <i className="fa fa-trash"></i> Delete
          </button>
          <button className="btn btn-default" onClick={() => router.back()} disabled={loading} style={{ marginLeft: '10px' }}>
            <i className="fa fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
