'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  request_date: string;
  status: string;
}

export default function ApproveMembersPage() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMembers();
  }, []);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/pending');
      setMembers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch pending members:', err);
      setError('Failed to load pending members');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string) => {
    try {
      setApproving(memberId);
      await api.post(`/members/${memberId}/approve`);
      fetchPendingMembers();
    } catch (err) {
      console.error('Failed to approve member:', err);
      setError('Failed to approve member');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      setApproving(memberId);
      await api.post(`/members/${memberId}/reject`);
      fetchPendingMembers();
    } catch (err) {
      console.error('Failed to reject member:', err);
      setError('Failed to reject member');
    } finally {
      setApproving(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Approve Members</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading pending members...</div>}

      {!loading && members.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Pending Approval ({members.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Request Date</th>
                  <th style={{ width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{formatDate(member.request_date)}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-success"
                        onClick={() => handleApprove(member.id)}
                        disabled={approving === member.id}
                      >
                        <i className="fa fa-check"></i> Approve
                      </button>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleReject(member.id)}
                        disabled={approving === member.id}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-times"></i> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && members.length === 0 && !error && (
        <div className="alert alert-info">No pending member approvals.</div>
      )}
    </div>
  );
}
