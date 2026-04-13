'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function MainPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stores');
      setStores(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); } catch { return dateString; }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Store Dashboard</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Your Stores ({stores.length})</h3>
        </div>
        {stores.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '100px'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td><span className={`label label-${store.status === 'active' ? 'success' : 'default'}`}>{store.status}</span></td>
                    <td>{formatDate(store.created_at)}</td>
                    <td><Link href={`/stores/${store.id}`} className="btn btn-xs btn-primary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body"><p>No stores found.</p></div>
        )}
      </div>

      <div className="panel panel-default" style={{ marginTop: '20px'}}>
        <div className="panel-heading"><h3 className="panel-title">Quick Links</h3></div>
        <div className="panel-body">
          <div className="btn-group">
            <Link href="/orders/list" className="btn btn-default">Orders</Link>
            <Link href="/products/list" className="btn btn-default">Products</Link>
            <Link href="/wholesale/list" className="btn btn-default">Wholesale</Link>
            <Link href="/customers/list" className="btn btn-default">Customers</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
