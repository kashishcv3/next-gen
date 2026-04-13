'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderBatch {
  id: string;
  batch_name: string;
  order_count: number;
  total_value: number;
  created_at: string;
  status: string;
  created_by: string;
}

export default function OrderBatchesPage() {
  const [batches, setBatches] = useState<OrderBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/batches');
      setBatches(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      setError('Failed to load order batches');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Batches</h1>
      <p className="text-muted">Manage grouped orders and batches</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading batches...</div>}

      {!loading && batches.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Order Batches ({batches.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Batch Name</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Order Count</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Total Value</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>{batch.batch_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">{batch.order_count}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(batch.total_value)}</td>
                    <td>{batch.created_by}</td>
                    <td>{formatDate(batch.created_at)}</td>
                    <td>
                      <span className={`label label-${getStatusClass(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-xs btn-primary">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && batches.length === 0 && !error && (
        <div className="alert alert-info">No order batches found.</div>
      )}

      {/* Create Batch Button */}
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-primary">
          <i className="fa fa-plus"></i> Create New Batch
        </button>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}
