'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PaymentGateway {
  id: string;
  gateway_name: string;
  api_key: string;
  api_secret: string;
  enabled: boolean;
}

export default function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const res = await api.get('/settings/payment');
      setGateways(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (gateway: PaymentGateway) => {
    setSuccess(null);
    try {
      await api.post('/settings/payment', gateway);
      setSuccess('Payment gateway settings saved');
      fetchGateways();
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Payment Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure payment gateway settings.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            {gateways.map((gateway, idx) => (
              <div key={idx} className="panel panel-default" style={{ marginBottom: '20px' }}>
                <div className="panel-heading">
                  <h3 className="panel-title">{gateway.gateway_name}</h3>
                </div>
                <div className="panel-body">
                  {editingId === gateway.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(gateway); }}>
                      <div className="form-group">
                        <label>API Key</label>
                        <input
                          type="text"
                          className="form-control"
                          value={gateway.api_key}
                          onChange={(e) => {
                            const updated = { ...gateway, api_key: e.target.value };
                            setGateways(gateways.map((g, i) => i === gateways.indexOf(gateway) ? updated : g));
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>API Secret</label>
                        <input
                          type="password"
                          className="form-control"
                          value={gateway.api_secret}
                          onChange={(e) => {
                            const updated = { ...gateway, api_secret: e.target.value };
                            setGateways(gateways.map((g, i) => i === gateways.indexOf(gateway) ? updated : g));
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input type="checkbox" checked={gateway.enabled} onChange={(e) => {
                            const updated = { ...gateway, enabled: e.target.checked };
                            setGateways(gateways.map((g, i) => i === gateways.indexOf(gateway) ? updated : g));
                          }} />
                          Enable Gateway
                        </label>
                      </div>
                      <button type="submit" className="btn btn-success"><i className="fa fa-save"></i> Save</button>
                      <button type="button" className="btn btn-default" onClick={() => setEditingId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <div>
                      <p>Status: {gateway.enabled ? <span className="label label-success">Enabled</span> : <span className="label label-danger">Disabled</span>}</p>
                      <button type="button" className="btn btn-primary" onClick={() => setEditingId(gateway.id)}><i className="fa fa-edit"></i> Edit</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
