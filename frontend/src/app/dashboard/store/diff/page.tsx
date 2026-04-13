'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StoreDiffPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/store/diff');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load diff data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Diff</h1>
          <p><i className="fa fa-info-circle"></i> View differences between store versions.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-code-fork"></i> Version Comparison</h3>
              </div>
              <div className="panel-body">
                <p>Store version comparison tools are available here.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
