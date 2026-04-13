'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'requested' | 'live';
  requested_date?: string;
  live_date?: string;
}

export default function StoreFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await api.get('/store/features');
      setFeatures(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (featureId: string) => {
    try {
      await api.post(`/store/features/${featureId}/request`, {});
      fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request feature');
    }
  };

  const handleMarkLive = async (featureId: string) => {
    try {
      await api.post(`/store/features/${featureId}/mark-live`, {});
      fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark feature as live');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      available: 'default',
      requested: 'info',
      live: 'success',
    };
    return <span className={`label label-${statusMap[status] || 'default'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Features</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage and request store features.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-star"></i> Features List
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Feature Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.length > 0 ? (
                      features.map(feature => (
                        <tr key={feature.id}>
                          <td>{feature.name}</td>
                          <td>{feature.description}</td>
                          <td>{getStatusBadge(feature.status)}</td>
                          <td>
                            <Link href={`/store/features/info?id=${feature.id}`} className="btn btn-xs btn-info">
                              <i className="fa fa-info"></i> Info
                            </Link>
                            {' '}
                            <Link href={`/store/features/edit?id=${feature.id}`} className="btn btn-xs btn-primary">
                              <i className="fa fa-edit"></i> Edit
                            </Link>
                            {' '}
                            {feature.status === 'available' && (
                              <button
                                className="btn btn-xs btn-success"
                                onClick={() => handleRequest(feature.id)}
                              >
                                <i className="fa fa-check"></i> Request
                              </button>
                            )}
                            {' '}
                            {feature.status === 'requested' && (
                              <button
                                className="btn btn-xs btn-warning"
                                onClick={() => handleMarkLive(feature.id)}
                              >
                                <i className="fa fa-rocket"></i> Mark Live
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">No features found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
