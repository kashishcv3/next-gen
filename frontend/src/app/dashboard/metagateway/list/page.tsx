'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MetaGateway {
  id: number;
  meta_name: string;
  display_name: string;
  meta_id: number;
  destination: string;
}

export default function MetaGatewayListPage() {
  const [gateways, setGateways] = useState<MetaGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/meta-gateways');
      setGateways(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch gateways:', err);
      setError('Failed to load gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this gateway?')) {
      try {
        await api.delete(`/marketing/meta-gateways/${id}`);
        fetchGateways();
      } catch (err) {
        console.error('Failed to delete gateway:', err);
        setError('Failed to delete gateway');
      }
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Meta Gateways</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/dashboard/metagateway/add" className="btn btn-success">
            <i className="fa fa-plus"></i> Create New Gateway
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading gateways...</div>}

      {!loading && gateways.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Meta Gateways ({gateways.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Meta Name</th>
                  <th>Display Name</th>
                  <th>Destination</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((gateway) => (
                  <tr key={gateway.id}>
                    <td>{gateway.meta_name}</td>
                    <td>{gateway.display_name}</td>
                    <td>{gateway.destination}</td>
                    <td>
                      <Link
                        href={`/dashboard/metagateway/edit/${gateway.id}`}
                        className="btn btn-xs btn-warning"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(gateway.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && gateways.length === 0 && !error && (
        <div className="alert alert-info">
          No gateways found. <Link href="/dashboard/metagateway/add">Create one now</Link>
        </div>
      )}
    </div>
  );
}
