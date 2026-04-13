'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ShippingItem {
  id: string;
  name: string;
  carrier: string;
  tracking_number: string;
  status: string;
  created_at: string;
}

export default function WholesaleShippingListPage() {
  const [items, setItems] = useState<ShippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShippings();
  }, []);

  const fetchShippings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale/shipping');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load shipping records');
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

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Shipping Records</h1>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/wholesale/shipping/add" className="btn btn-success">
          <i className="fa fa-plus"></i> Add Shipping Record
        </Link>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Shipping Records ({items.length})</h3>
        </div>
        {items.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Carrier</th>
                  <th>Tracking Number</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.carrier}</td>
                    <td>{item.tracking_number}</td>
                    <td>
                      <span className={`label label-${item.status === 'delivered' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <Link href={`/wholesale/shipping/edit/${item.id}`} className="btn btn-xs btn-warning">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No shipping records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
