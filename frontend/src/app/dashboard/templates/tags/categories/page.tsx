'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Item {
  id: string;
  name: string;
  status?: string;
  created_at?: string;
}

export default function ListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/templates/tags?${params.toString()}`);
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchItems(search);
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
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Tag Categories</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px'}}>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-md-6">
              <button className="btn btn-primary" onClick={handleSearch}>
                <i className="fa fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Items ({items.length})</h3>
        </div>
        {items.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '120px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.status || 'N/A'}</td>
                    <td>{item.created_at ? formatDate(item.created_at) : 'N/A'}</td>
                    <td>
                      <Link href={`/templates/tags/view/${item.id}`} className="btn btn-xs btn-primary">
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
            <p>No items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
