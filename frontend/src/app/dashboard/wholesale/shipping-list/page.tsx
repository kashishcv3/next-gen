'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ShippingEntry {
  id: number;
  member_id: number;
  member_name: string;
  shipping_method: string;
  cost: number;
  created_at: string | null;
}

export default function WholesaleShippingPage() {
  const [shipping, setShipping] = useState<ShippingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/wholesale/shipping');
      setShipping(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load wholesale shipping');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-truck" style={{ color: '#337ab7' }}></i> Wholesale Shipping</h1>
          <p className="text-muted">Manage wholesale shipping methods and rates for wholesale members.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <span className="label label-info" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-truck"></i> Shipping Methods: {shipping.length}
          </span>
          <button className="btn btn-default btn-sm" onClick={fetchData} style={{ marginLeft: '10px' }}>
            <i className="fa fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading wholesale shipping...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-ship" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Wholesale Shipping Methods
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        <th style={{ fontWeight: 600 }}>ID</th>
                        <th style={{ fontWeight: 600 }}>Company</th>
                        <th style={{ fontWeight: 600 }}>Shipping Method</th>
                        <th style={{ fontWeight: 600 }}>Cost</th>
                        <th style={{ fontWeight: 600 }}>Created</th>
                        <th style={{ fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipping.length > 0 ? shipping.map(entry => (
                        <tr key={entry.id}>
                          <td><span className="label label-default">{entry.id}</span></td>
                          <td style={{ fontWeight: 600 }}>{entry.member_name || `Member #${entry.member_id}`}</td>
                          <td>{entry.shipping_method}</td>
                          <td>${entry.cost.toFixed(2)}</td>
                          <td>{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <a href={`/dashboard/wholesale/shipping/edit/${entry.id}`} className="btn btn-xs btn-info">
                              <i className="fa fa-pencil"></i> Edit
                            </a>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                            No wholesale shipping methods found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
