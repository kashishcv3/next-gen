'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  api_key: string;
  api_url: string;
  status: string;
  last_sync: string;
}

const INTEGRATION_TYPES = [
  'Standard',
  'Aero',
  'MOM',
  'InOrder',
  'NewHaven',
  'OrderMotion',
  'SysPro',
  'Stone Edge',
  'Vista',
  'Custom',
];

export default function OrderManagementPage() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IntegrationConfig>>({});

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/integrations');
      setIntegrations(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (integration: IntegrationConfig) => {
    setEditingId(integration.id);
    setFormData(integration);
  };

  const handleSave = async () => {
    if (!editingId || !formData.id) return;

    try {
      await api.put(`/orders/integrations/${editingId}`, formData);
      await fetchIntegrations();
      setEditingId(null);
      setFormData({});
    } catch (err) {
      console.error('Failed to save integration:', err);
      setError('Failed to save integration');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const toggleIntegration = async (id: string, enabled: boolean) => {
    try {
      await api.patch(`/orders/integrations/${id}`, { enabled: !enabled });
      await fetchIntegrations();
    } catch (err) {
      console.error('Failed to toggle integration:', err);
      setError('Failed to update integration');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading integrations...</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Management Integrations</h1>
      <p className="text-muted">Configure and manage order system integrations</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Integration Configs */}
      {INTEGRATION_TYPES.map((integrationType) => {
        const integration = integrations.find((i) => i.type === integrationType);

        return (
          <div key={integrationType} className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{integrationType}</span>
                <span className={`label label-${integration?.enabled ? 'success' : 'danger'}`}>
                  {integration?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </h3>
            </div>
            <div className="panel-body">
              {integration && editingId === integration.id ? (
                <div>
                  <div className="form-group">
                    <label htmlFor={`apiKey-${integrationType}`}>API Key</label>
                    <input
                      type="password"
                      className="form-control"
                      id={`apiKey-${integrationType}`}
                      value={formData.api_key || ''}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`apiUrl-${integrationType}`}>API URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id={`apiUrl-${integrationType}`}
                      value={formData.api_url || ''}
                      onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                      placeholder="https://api.example.com"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-success" onClick={handleSave}>
                      <i className="fa fa-save"></i> Save
                    </button>
                    <button className="btn btn-default" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {integration ? (
                    <div>
                      <p><strong>Status:</strong> {integration.status}</p>
                      <p><strong>Last Sync:</strong> {formatDate(integration.last_sync)}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEdit(integration)}
                        >
                          <i className="fa fa-edit"></i> Configure
                        </button>
                        <button
                          className={`btn ${integration.enabled ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => toggleIntegration(integration.id, integration.enabled)}
                        >
                          {integration.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-default">
                          <i className="fa fa-refresh"></i> Sync Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">Not configured</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Information Panel */}
      <div className="panel panel-info">
        <div className="panel-heading">
          <h3 className="panel-title">Integration Information</h3>
        </div>
        <div className="panel-body">
          <p>
            <strong>Standard:</strong> Basic order management system
          </p>
          <p>
            <strong>Aero:</strong> Aero Commerce integration
          </p>
          <p>
            <strong>MOM:</strong> Multi-Order Manager integration
          </p>
          <p>
            <strong>InOrder:</strong> InOrder OMS integration
          </p>
          <p>
            <strong>NewHaven:</strong> NewHaven Retail integration
          </p>
          <p>
            <strong>OrderMotion:</strong> OrderMotion OMS integration
          </p>
          <p>
            <strong>SysPro:</strong> SysPro ERP integration
          </p>
          <p>
            <strong>Stone Edge:</strong> Stone Edge Order Manager integration
          </p>
          <p>
            <strong>Vista:</strong> Vista OMS integration
          </p>
          <p>
            <strong>Custom:</strong> Custom integration for third-party systems
          </p>
        </div>
      </div>
    </div>
  );
}
