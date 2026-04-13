'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale');
      setData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Wholesale</h1>
      <div className="panel panel-default">
        <div className="panel-heading"><h3 className="panel-title">Content</h3></div>
        <div className="panel-body">
          <p>Page content for Edit Wholesale</p>
        </div>
      </div>
      <Link href="/wholesale/list" className="btn btn-default">Back</Link>
    </div>
  );
}
