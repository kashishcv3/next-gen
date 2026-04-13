'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShippingGroupDeletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (groupId) fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/shipping/groups/${groupId}`);
      setGroupName(res.data.data?.name || 'Unknown');
    } catch (err: any) {
      setError('Failed to load group');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/shipping/groups/${groupId}`);
      router.push('/shipping/groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Delete Shipping Group</h1>
          <p><i className="fa fa-warning"></i> This action cannot be undone.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-6">
          <div className="panel panel-danger">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-trash"></i> Confirm Delete</h3>
            </div>
            <div className="panel-body">
              <p>Are you sure you want to delete the group "{groupName}"?</p>
              <div className="alert alert-danger">This action cannot be undone.</div>
            </div>
          </div>

          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Group'}
          </button>
          <a href="/shipping/groups" className="btn btn-default">Cancel</a>
        </div>
      </div>
    </div>
  );
}
