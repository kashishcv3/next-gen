'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MOMItem {
  id: string;
  name: string;
  category: string;
  wholesale_count: number;
  created_at: string;
}

export default function WholesaleMOMPage() {
  const [items, setItems] = useState<MOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMOMItems();
  }, []);

  const fetchMOMItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale/mom');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load MOM items');
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

  if (loading) return <div className="alert alert-info">Loading MOM...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Monthly Order Manager (MOM)</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">MOM Items ({items.length})</h3>
        </div>
        {items.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Wholesale Count</th>
                  <th>Created</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className="badge">{item.wholesale_count}</span>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <Link href={`/wholesale/mom/${item.id}`} className="btn btn-xs btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No MOM items found.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link href="/wholesale/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Wholesale
        </Link>
      </div>
    </div>
  );
}
