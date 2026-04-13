'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DeleteGroupDataPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!dataId) {
      setError('Invalid data ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this data?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/customer-groups/data/${dataId}`);
      router.back();
    } catch (err) {
      console.error('Failed to delete data:', err);
      setError('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Group Data</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-danger">
        <div className="panel-heading">
          <h3 className="panel-title">Confirm Deletion</h3>
        </div>
        <div className="panel-body">
          <p>Are you sure you want to delete this data? This action cannot be undone.</p>
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
