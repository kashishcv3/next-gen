'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  description: string;
}

export default function CopyGroupPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const selected = groups.find((g) => g.id === selectedId);
      if (selected) {
        setNewName(`${selected.name} (Copy)`);
      }
    }
  }, [selectedId, groups]);

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

  const handleCopy = async () => {
    if (!selectedId) {
      setError('Please select a group');
      return;
    }

    if (!newName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setCopying(true);
      const response = await api.post('/customer-groups/copy', {
        source_id: selectedId,
        new_name: newName,
      });
      router.push(`/customer-groups/list`);
    } catch (err) {
      console.error('Failed to copy group:', err);
      setError('Failed to copy group');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Copy Customer Group</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading groups...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Copy Group</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="source">Source Group</label>
                  <select
                    className="form-control"
                    id="source"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={copying}
                  >
                    <option value="">-- Select a group --</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="newName">New Group Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New group name"
                    disabled={copying}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCopy}
                  disabled={copying || !selectedId}
                >
                  <i className="fa fa-copy"></i> Copy Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
