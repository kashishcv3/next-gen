'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Feature {
  id: string;
  name: string;
  description: string;
  status: string;
  requested_date?: string;
  live_date?: string;
  info?: Record<string, any>;
}

export default function FeatureInfoPage() {
  const searchParams = useSearchParams();
  const featureId = searchParams.get('id');

  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (featureId) {
      fetchFeature();
    }
  }, [featureId]);

  const fetchFeature = async () => {
    try {
      const res = await api.get(`/store/features/${featureId}`);
      setFeature(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feature');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="alert alert-danger">Feature not found</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Feature Information</h1>
          <p>
            <i className="fa fa-info-circle"></i> View detailed feature information.
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

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-star"></i> {feature.name}</h3>
            </div>
            <div className="panel-body">
              <dl className="dl-horizontal">
                <dt>Name:</dt>
                <dd>{feature.name}</dd>

                <dt>Description:</dt>
                <dd>{feature.description}</dd>

                <dt>Status:</dt>
                <dd>
                  <span className={`label label-${
                    feature.status === 'live' ? 'success' :
                    feature.status === 'requested' ? 'info' :
                    'default'
                  }`}>
                    {feature.status}
                  </span>
                </dd>

                {feature.requested_date && (
                  <>
                    <dt>Requested Date:</dt>
                    <dd>{new Date(feature.requested_date).toLocaleDateString()}</dd>
                  </>
                )}

                {feature.live_date && (
                  <>
                    <dt>Live Date:</dt>
                    <dd>{new Date(feature.live_date).toLocaleDateString()}</dd>
                  </>
                )}
              </dl>

              {feature.info && Object.keys(feature.info).length > 0 && (
                <hr />
              )}

              {feature.info && Object.entries(feature.info).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}:</dt>
                  <dd><code>{JSON.stringify(value)}</code></dd>
                </div>
              ))}
            </div>
          </div>

          <Link href="/store/features" className="btn btn-default">
            <i className="fa fa-arrow-left"></i> Back to Features
          </Link>
        </div>
      </div>
    </div>
  );
}
