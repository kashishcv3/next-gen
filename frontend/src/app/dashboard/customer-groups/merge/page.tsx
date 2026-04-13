'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
}

export default function MergeGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
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

  const handleMerge = async () => {
    if (!sourceId || !targetId) {
      setError('Please select both groups');
      return;
    }

    if (sourceId === targetId) {
      setError('Please select different groups');
      return;
    }

    try {
      setMerging(true);
      await api.post('/customer-groups/merge', {
        source_id: sourceId,
        target_id: targetId,
      });
      router.push('/customer-groups/list');
    } catch (err) {
      console.error('Failed to merge groups:', err);
      setError('Failed to merge groups');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Merge Customer Groups</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading groups...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Merge Groups</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="source">Source Group (will be merged into)</label>
                  <select
                    className="form-control"
                    id="source"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    disabled={merging}
                  >
                    <option value="">-- Select source group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="target">Target Group (will receive members)</label>
                  <select
                    className="form-control"
                    id="target"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    disabled={merging}
                  >
                    <option value="">-- Select target group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleMerge}
                  disabled={merging || !sourceId || !targetId}
                >
                  <i className="fa fa-object-group"></i> Merge Groups
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel panel-info">
              <div className="panel-heading">
                <h3 className="panel-title">Information</h3>
              </div>
              <div className="panel-body">
                <p>Merging will move all members from the source group to the target group.</p>
                <p>The source group will be deleted after the merge is complete.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
