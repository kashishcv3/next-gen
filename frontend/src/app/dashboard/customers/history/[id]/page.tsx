'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CustomerHistory {
  id: string;
  customer_name: string;
  action: string;
  details: string;
  action_date: string;
}

export default function CustomerHistoryPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [history, setHistory] = useState<CustomerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [customerId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/${customerId}/history`);
      setHistory(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load customer history');
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
      <h1>Customer History</h1>

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
        <div className="alert alert-info">No history found for this customer.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/customers/search" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Customers
        </Link>
      </div>
    </div>
  );
}
