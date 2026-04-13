'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface MemberHistory {
  id: string;
  action: string;
  details: string;
  action_date: string;
}

export default function MemberHistoryPage() {
  const params = useParams();
  const memberId = params.id as string;

  const [history, setHistory] = useState<MemberHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [memberId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${memberId}/history`);
      setHistory(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load member history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Member History</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading history...</div>}

      {!loading && history.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Activity History ({history.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.action}</td>
                    <td>{item.details}</td>
                    <td>{formatDate(item.action_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && history.length === 0 && !error && (
        <div className="alert alert-info">No history found.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/customers/members/search" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Members
        </Link>
      </div>
    </div>
  );
}
