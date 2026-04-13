'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

export default function WholesalePreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wholesale/${id}`);
      setData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="alert alert-info">Loading preview...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Customer Preview</h1>
      <div className="panel panel-default">
        <div className="panel-body">
          <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h2>{data?.company_name}</h2>
            <p><strong>Contact:</strong> {data?.contact_name}</p>
            <p><strong>Email:</strong> {data?.email}</p>
            <p><strong>Phone:</strong> {data?.phone}</p>
            <p><strong>Address:</strong> {data?.address}, {data?.city}, {data?.state} {data?.postal_code}</p>
            <p><strong>Status:</strong> <span className={`label label-${data?.status === 'active' ? 'success' : 'default'}`}>{data?.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
