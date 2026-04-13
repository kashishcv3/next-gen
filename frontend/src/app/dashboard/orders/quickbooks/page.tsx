'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface QuickBooksConfig {
  id: string;
  enabled: boolean;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  sync_interval: number;
  last_sync: string;
  auto_sync: boolean;
  map_customer_names: boolean;
  map_products: boolean;
}

export default function OrderQuickBooksPage() {
  const [config, setConfig] = useState<QuickBooksConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/quickbooks-config');
      setConfig(response.data.data || getDefaultConfig());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch QB config:', err);
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfig = (): QuickBooksConfig => ({
    id: '1',
    enabled: false,
    realm_id: '',
    access_token: '',
    refresh_token: '',
    sync_interval: 3600,
    last_sync: '',
    auto_sync: false,
    map_customer_names: true,
    map_products: true,
  });

  const handleSave = async () => {
    if (!config) return;

    try {
      setLoading(true);
      await api.put('/orders/quickbooks-config', config);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
      setError(null);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError('Failed to save QuickBooks configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      await api.post('/orders/quickbooks-sync');
      setSuccess(true);
      await fetchConfig();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to sync:', err);
      setError('Failed to sync with QuickBooks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (!config) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-danger">Failed to load configuration</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>QuickBooks Integration</h1>
      <p className="text-muted">Configure and manage QuickBooks Online synchronization</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Configuration saved successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">QuickBooks Online Settings</h3>
            </div>
            <div className="panel-body">
              {!editing ? (
                <div>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`label label-${config.enabled ? 'success' : 'danger'}`}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </p>
                      <p>
                        <strong>Realm ID:</strong> {config.realm_id || 'Not configured'}
                      </p>
                      <p>
                        <strong>Last Sync:</strong> {formatDate(config.last_sync)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Auto Sync:</strong>{' '}
                        {config.auto_sync ? (
                          <span className="label label-success">Enabled</span>
                        ) : (
                          <span className="label label-danger">Disabled</span>
                        )}
                      </p>
                      <p>
                        <strong>Sync Interval:</strong> {config.sync_interval} seconds
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditing(true)}
                    >
                      <i className="fa fa-edit"></i> Edit Configuration
                    </button>
                    <button
                      className="btn btn-default"
                      onClick={handleSync}
                      style={{ marginLeft: '10px' }}
                      disabled={!config.enabled}
                    >
                      <i className="fa fa-refresh"></i> Sync Now
                    </button>
                  </div>
                </div>
              ) : (
                <form>
                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                      />
                      Enable QuickBooks Integration
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="realmId">Realm ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="realmId"
                      value={config.realm_id}
                      onChange={(e) => setConfig({ ...config, realm_id: e.target.value })}
                      placeholder="Your QuickBooks Realm ID"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="syncInterval">Sync Interval (seconds)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="syncInterval"
                      value={config.sync_interval}
                      onChange={(e) => setConfig({ ...config, sync_interval: parseInt(e.target.value) })}
                      min="300"
                      step="60"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={config.auto_sync}
                        onChange={(e) => setConfig({ ...config, auto_sync: e.target.checked })}
                      />
                      Enable Automatic Synchronization
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={config.map_customer_names}
                        onChange={(e) => setConfig({ ...config, map_customer_names: e.target.checked })}
                      />
                      Map Customer Names
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={config.map_products}
                        onChange={(e) => setConfig({ ...config, map_products: e.target.checked })}
                      />
                      Map Products
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      <i className="fa fa-save"></i> Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Integration Information</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>QuickBooks Online:</strong> Automatically sync orders and customer data to your QuickBooks account.
              </p>
              <hr />
              <h5>Features</h5>
              <ul>
                <li>Automatic order synchronization</li>
                <li>Customer data mapping</li>
                <li>Product inventory sync</li>
                <li>Scheduled or manual sync</li>
                <li>Error logging and monitoring</li>
              </ul>
              <hr />
              <p>
                <strong>Note:</strong> Requires valid QuickBooks Online account and API credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
