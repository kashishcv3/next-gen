'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

export default function GoogleBasePage() {
  const { siteId } = useStore();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, [siteId]);

  const fetchConfigs = async () => {
    try {
      const res = await api.get(`/stores/google-base/${siteId}`);
      setConfigs(res.data.configs || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load Google Shopping configs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Google Shopping</h1>
          <p><i className="fa fa-info-circle"></i> Configure Google Shopping and Merchant Center integration.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-google"></i> Google Shopping Integration</h3>
            </div>
            <div className="panel-body">
              {configs.length > 0 ? (
                configs.map(config => (
                  <div key={config.id} className="well">
                    <h4>Merchant ID: {config.merchant_id}</h4>
                    <p>Email: {config.account_email}</p>
                    <p>Feed URL: <code>{config.feed_url}</code></p>
                    <p>Status: {config.is_active ? <span className="label label-success">Active</span> : <span className="label label-danger">Inactive</span>}</p>
                    <button className="btn btn-primary"><i className="fa fa-edit"></i> Edit</button>
                  </div>
                ))
              ) : (
                <p>No Google Shopping configuration found. <button className="btn btn-primary"><i className="fa fa-plus"></i> Add Configuration</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
