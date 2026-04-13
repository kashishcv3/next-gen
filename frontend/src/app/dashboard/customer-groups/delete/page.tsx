'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  member_count: number;
}

export default function DeleteGroupPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer-groups');
      setGroups(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Please select a group');
      return;
    }

    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/customer-groups/${selectedId}`);
      router.push('/customer-groups/list');
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError('Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const selected = groups.find((g) => g.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Customer Group</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading groups...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Delete Group</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action is permanent.
                </div>

                <div className="form-group">
                  <label htmlFor="group">Select Group</label>
                  <select
                    className="form-control"
                    id="group"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={deleting}
                  >
                    <option value="">-- Select a group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Group Details</h3>
                    </div>
                    <div className="panel-body">
                      <p>
                        <strong>Name:</strong> {selected.name}
                      </p>
                      <p>
                        <strong>Members:</strong> {selected.member_count}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleDelete}
                  disabled={deleting || !selectedId}
                >
                  <i className="fa fa-trash"></i> Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
