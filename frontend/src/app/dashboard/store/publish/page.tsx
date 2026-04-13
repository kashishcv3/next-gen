'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PublishInfo {
  pending_changes: number;
  last_published: string;
  can_publish: boolean;
  warning_message?: string;
}

export default function StorePublishPage() {
  const [publishInfo, setPublishInfo] = useState<PublishInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchPublishInfo();
  }, []);

  const fetchPublishInfo = async () => {
    try {
      const res = await api.get('/store/publish/info');
      setPublishInfo(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load publish information');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish all pending changes?')) return;

    setPublishing(true);
    setError(null);

    try {
      await api.post('/store/publish', {});
      fetchPublishInfo();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish changes');
    } finally {
      setPublishing(false);
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

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Publish Store Changes</h1>
          <p>
            <i className="fa fa-info-circle"></i> Publish pending changes to your live store.
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

      {publishInfo && (
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-upload"></i> Publish Changes</h3>
              </div>
              <div className="panel-body">
                <dl className="dl-horizontal">
                  <dt>Pending Changes:</dt>
                  <dd>
                    <span className={`label label-${publishInfo.pending_changes > 0 ? 'warning' : 'success'}`}>
                      {publishInfo.pending_changes}
                    </span>
                  </dd>

                  <dt>Last Published:</dt>
                  <dd>
                    {publishInfo.last_published
                      ? new Date(publishInfo.last_published).toLocaleString()
                      : 'Never'}
                  </dd>

                  <dt>Status:</dt>
                  <dd>
                    <span className={`label label-${publishInfo.can_publish ? 'success' : 'danger'}`}>
                      {publishInfo.can_publish ? 'Ready to Publish' : 'Cannot Publish'}
                    </span>
                  </dd>
                </dl>

                {publishInfo.warning_message && (
                  <div className="alert alert-warning">
                    <strong>Warning:</strong> {publishInfo.warning_message}
                  </div>
                )}

                {publishInfo.pending_changes > 0 && (
                  <div className="alert alert-info">
                    You have {publishInfo.pending_changes} pending change{publishInfo.pending_changes !== 1 ? 's' : ''} ready to be published.
                  </div>
                )}
              </div>
            </div>

            {publishInfo.can_publish && publishInfo.pending_changes > 0 && (
              <button
                className="btn btn-primary btn-lg"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? 'Publishing...' : 'Publish Changes'}
              </button>
            )}

            {!publishInfo.can_publish && (
              <button className="btn btn-primary btn-lg" disabled>
                Cannot Publish
              </button>
            )}

            <a href="/store/overview" className="btn btn-default btn-lg">
              Cancel
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
