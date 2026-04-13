'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StoreChannelAdvisorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/store/channel-advisor');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>ChannelAdvisor</h1>
          <p><i className="fa fa-info-circle"></i> Manage ChannelAdvisor integration.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-store"></i> ChannelAdvisor Configuration</h3>
              </div>
              <div className="panel-body">
                <p>ChannelAdvisor integration and configuration tools are available here.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
