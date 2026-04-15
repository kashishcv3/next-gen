'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

/**
 * Feature Info popup page.
 * Replicates old platform's store_features_info.tpl — opened in a popup window.
 */
export default function StoreFeaturesInfoPage() {
  const searchParams = useSearchParams();
  const featureName = searchParams.get('name') || '';
  const [feature, setFeature] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (featureName) fetchFeature();
  }, [featureName]);

  const fetchFeature = async () => {
    try {
      const res = await api.get(`/store-features/feature/${encodeURIComponent(featureName)}`);
      setFeature(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load feature info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!feature) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Feature not found.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Feature Info - {feature.title}</h1>
          <br />
          <p
            dangerouslySetInnerHTML={{
              __html: (feature.info || '').replace(/\n/g, '<br/>'),
            }}
          />
        </div>
      </div>
      <br />
      <br />
    </div>
  );
}
