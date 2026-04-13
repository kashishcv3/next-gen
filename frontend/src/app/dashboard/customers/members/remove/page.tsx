'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function RemoveMemberPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members');
      setMembers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedId) {
      setError('Please select a member to remove');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setRemoving(true);
      await api.delete(`/members/${selectedId}`);
      router.push('/customers/members/search');
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError('Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  const selected = members.find((m) => m.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Remove Member</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading members...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Remove Member</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action will remove the member from the system.
                </div>

                <div className="form-group">
                  <label htmlFor="member">Select Member</label>
                  <select
                    className="form-control"
                    id="member"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={removing}
                  >
                    <option value="">-- Select a member --</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Member Details</h3>
                    </div>
                    <div className="panel-body">
                      <p>
                        <strong>Name:</strong> {selected.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selected.email}
                      </p>
                      <p>
                        <strong>Status:</strong> {selected.status}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleRemove}
                  disabled={removing || !selectedId}
                >
                  <i className="fa fa-trash"></i> Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
