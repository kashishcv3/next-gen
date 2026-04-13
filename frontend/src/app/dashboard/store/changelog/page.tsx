'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  changed_by: string;
  changed_date: string;
  version: string;
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChangelog();
  }, []);

  const fetchChangelog = async () => {
    try {
      const res = await api.get('/store/changelog');
      setEntries(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load changelog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Changelog</h1>
          <p>
            <i className="fa fa-info-circle"></i> View the history of changes made to your store.
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
            {entries.length > 0 ? (
              entries.map(entry => (
                <div key={entry.id} className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">
                      Version {entry.version}: {entry.title}
                    </h3>
                  </div>
                  <div className="panel-body">
                    <p>{entry.description}</p>
                    <small>
                      Changed by {entry.changed_by} on {new Date(entry.changed_date).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-info">No changelog entries found</div>
            )}
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
