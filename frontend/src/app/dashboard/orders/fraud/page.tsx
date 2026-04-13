'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface FraudService {
  id: string;
  name: string;
  enabled: boolean;
  api_key: string;
  config: Record<string, any>;
}

const FRAUD_SERVICES = [
  { id: 'maxmind', name: 'MaxMind', description: 'Fraud detection and IP intelligence' },
  { id: 'kount', name: 'Kount', description: 'Advanced fraud prevention platform' },
  { id: 'sift', name: 'Sift Science', description: 'Machine learning fraud prevention' },
  { id: 'signifyd', name: 'Signifyd', description: 'Chargeback guarantee and protection' },
];

export default function OrderFraudServicesPage() {
  const [services, setServices] = useState<FraudService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FraudService>>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/fraud-services');
      setServices(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch fraud services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: FraudService) => {
    setEditingId(service.id);
    setFormData(service);
  };

  const handleSave = async () => {
    if (!editingId || !formData.id) return;

    try {
      await api.put(`/orders/fraud-services/${editingId}`, formData);
      await fetchServices();
      setEditingId(null);
      setFormData({});
    } catch (err) {
      console.error('Failed to save service:', err);
      setError('Failed to save fraud service');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const toggleService = async (id: string, enabled: boolean) => {
    try {
      await api.patch(`/orders/fraud-services/${id}`, { enabled: !enabled });
      await fetchServices();
    } catch (err) {
      console.error('Failed to toggle service:', err);
      setError('Failed to update service');
    }
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading services...</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Fraud Services Configuration</h1>
      <p className="text-muted">Configure fraud detection and prevention services</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}

      {FRAUD_SERVICES.map((serviceInfo) => {
        const service = services.find((s) => s.id === serviceInfo.id);

        return (
          <div key={serviceInfo.id} className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{serviceInfo.name}</span>
                <span className={`label label-${service?.enabled ? 'success' : 'danger'}`}>
                  {service?.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </h3>
            </div>
            <div className="panel-body">
              <p className="text-muted">{serviceInfo.description}</p>

              {service && editingId === service.id ? (
                <div>
                  <div className="form-group">
                    <label htmlFor={`apiKey-${serviceInfo.id}`}>API Key</label>
                    <input
                      type="password"
                      className="form-control"
                      id={`apiKey-${serviceInfo.id}`}
                      value={formData.api_key || ''}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Enter API key"
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
                  {service ? (
                    <div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEdit(service)}
                        >
                          <i className="fa fa-edit"></i> Configure
                        </button>
                        <button
                          className={`btn ${service.enabled ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => toggleService(service.id, service.enabled)}
                        >
                          {service.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-default">
                          <i className="fa fa-refresh"></i> Test Connection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted">Not configured. Click configure to set up this service.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
