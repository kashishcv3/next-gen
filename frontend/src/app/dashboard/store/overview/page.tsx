'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StoreInfo {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  status: string;
  products_count: number;
  orders_count: number;
}

export default function StoreOverviewPage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const res = await api.get('/store/overview');
      setStoreInfo(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load store information');
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

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Overview</h1>
          <p>
            <i className="fa fa-info-circle"></i> View your store information and statistics.
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

      {storeInfo && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-store"></i> Store Information
                </h3>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-6">
                    <dl className="dl-horizontal">
                      <dt>Store Name:</dt>
                      <dd>{storeInfo.name}</dd>

                      <dt>Display Name:</dt>
                      <dd>{storeInfo.display_name || 'N/A'}</dd>

                      <dt>Status:</dt>
                      <dd>
                        <span className={`label label-${storeInfo.status === 'active' ? 'success' : 'danger'}`}>
                          {storeInfo.status}
                        </span>
                      </dd>
                    </dl>
                  </div>
                  <div className="col-md-6">
                    <dl className="dl-horizontal">
                      <dt>Created:</dt>
                      <dd>{new Date(storeInfo.created_at).toLocaleDateString()}</dd>

                      <dt>Products:</dt>
                      <dd>{storeInfo.products_count}</dd>

                      <dt>Orders:</dt>
                      <dd>{storeInfo.orders_count}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-link"></i> Quick Links
                </h3>
              </div>
              <div className="panel-body">
                <ul className="list-unstyled">
                  <li><a href="/store/options"><i className="fa fa-cogs"></i> Store Options</a></li>
                  <li><a href="/store/features"><i className="fa fa-star"></i> Features</a></li>
                  <li><a href="/store/launch-checklist"><i className="fa fa-check"></i> Launch Checklist</a></li>
                  <li><a href="/settings/general"><i className="fa fa-sliders"></i> General Settings</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
