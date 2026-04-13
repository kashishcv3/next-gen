'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface GroupData {
  id: string;
  key: string;
  value: string;
  created_date: string;
}

export default function GroupDataPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [data, setData] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customer-groups/${groupId}/data`);
      setData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load group data');
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

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Customer Group Data</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading data...</div>}

      {!loading && data.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Group Data ({data.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Created</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.key}</td>
                    <td>{item.value}</td>
                    <td>{formatDate(item.created_date)}</td>
                    <td>
                      <Link href={`/customer-groups/data/delete?id=${item.id}`} className="btn btn-xs btn-danger">
                        <i className="fa fa-trash"></i> Delete
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div className="alert alert-info">No data found for this group.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/customer-groups/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Groups
        </Link>
      </div>
    </div>
  );
}
