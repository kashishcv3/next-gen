'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Shipper {
  id: string;
  method: string;
  admin_display?: string;
  rate_tool: string;
  auto_id: string;
  code: string;
  visible: string;
  default_method: string;
}

export default function ShippingListPage() {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [defaultMethod, setDefaultMethod] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchShippers();
  }, []);

  const fetchShippers = async () => {
    try {
      const res = await api.get('/shipping/methods');
      const data = res.data.data || [];
      setShippers(data);

      const vis: Record<string, boolean> = {};
      let defMethod = '';
      data.forEach((shipper: Shipper) => {
        vis[shipper.id] = shipper.visible === 'y';
        if (shipper.default_method === 'y') {
          defMethod = shipper.id;
        }
      });
      setVisibility(vis);
      setDefaultMethod(defMethod);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipping methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shipperId: string) => {
    if (!window.confirm('Are you sure you want to delete this shipping method? This cannot be undone.')) return;
    try {
      await api.delete(`/shipping/methods/${shipperId}`);
      setSuccess('Shipping method deleted');
      setTimeout(() => setSuccess(null), 3000);
      fetchShippers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete shipping method');
    }
  };

  const handleMoveUp = async (shipperId: string) => {
    try {
      await api.post(`/shipping/methods/${shipperId}/move-up`);
      fetchShippers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to move shipping method');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const updates = shippers.map((shipper) => ({
        id: shipper.id,
        visible: visibility[shipper.id] ? 'y' : 'n',
        default_method: defaultMethod === shipper.id ? 'y' : 'n',
      }));
      await api.post('/shipping/methods/update-visibility', updates);
      setSuccess('Shipping methods updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchShippers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update visibility');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading shipping methods...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-truck" style={{ color: '#337ab7' }}></i> Shipping Tables</h1>
          <p className="text-muted">Add shippers, edit shipping tables, and configure your store's shipping methods.</p>
          <div className="alert alert-warning" style={{ display: 'inline-block' }}>
            <i className="fa fa-exclamation-triangle"></i> <strong>Priority Note:</strong> For shipping upgrades to work properly, shipping tables must be correctly prioritized with the "best" or highest method at the top.
          </div>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <Link href="/dashboard/shipping/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Shipper
          </Link>
          {' '}
          <Link href="/dashboard/shipping/groups" className="btn btn-default">
            <i className="fa fa-object-group"></i> View Shipping Groups
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSubmit}>
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-list" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Shipping Methods
                  {shippers.length > 0 && <span className="badge" style={{ marginLeft: '8px', background: '#337ab7' }}>{shippers.length}</span>}
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Shipper</th>
                      <th className="text-center">Rate Tool</th>
                      <th className="text-center">Auto ID</th>
                      <th className="text-center">Import Code</th>
                      <th className="text-center">Visible</th>
                      <th className="text-center">Default</th>
                      <th className="text-right" style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippers.length > 0 ? shippers.map((shipper, index) => (
                      <tr key={shipper.id}>
                        <td>
                          <Link href={`/dashboard/shipping/edit/${shipper.id}`} style={{ fontWeight: 600 }}>
                            {shipper.method}
                          </Link>
                          {shipper.admin_display && (
                            <small className="text-muted" style={{ marginLeft: '6px' }}>({shipper.admin_display})</small>
                          )}
                        </td>
                        <td className="text-center">
                          {shipper.rate_tool ? (
                            <span className="label label-info">{shipper.rate_tool}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-center">{shipper.auto_id || '—'}</td>
                        <td className="text-center">
                          {shipper.code ? (
                            <code style={{ fontSize: '12px' }}>{shipper.code}</code>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div
                            onClick={() => setVisibility(prev => ({ ...prev, [shipper.id]: !prev[shipper.id] }))}
                            style={{
                              width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer',
                              background: visibility[shipper.id] ? '#5cb85c' : '#ccc',
                              position: 'relative', transition: 'background 0.2s',
                              display: 'inline-block',
                            }}
                          >
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                              position: 'absolute', top: '2px', left: visibility[shipper.id] ? '20px' : '2px',
                              transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }} />
                          </div>
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name="default_method"
                            value={shipper.id}
                            checked={defaultMethod === shipper.id}
                            onChange={(e) => setDefaultMethod(e.target.value)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                        </td>
                        <td className="text-right">
                          {index > 0 && (
                            <>
                              <button type="button" className="btn btn-xs btn-default" onClick={() => handleMoveUp(shipper.id)} title="Move Up">
                                <i className="fa fa-arrow-up"></i>
                              </button>
                              {' '}
                            </>
                          )}
                          <Link href={`/dashboard/shipping/edit/${shipper.id}`} className="btn btn-xs btn-info" title="Edit">
                            <i className="fa fa-edit"></i>
                          </Link>
                          {' '}
                          {shippers.length > 1 && (
                            <button type="button" className="btn btn-xs btn-danger" onClick={() => handleDelete(shipper.id)} title="Delete">
                              <i className="fa fa-trash-o"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="text-center" style={{ padding: '30px' }}>
                          <i className="fa fa-truck" style={{ fontSize: '24px', color: '#ccc', display: 'block', marginBottom: '10px' }}></i>
                          <span className="text-muted">No shipping methods configured.</span>
                          <br />
                          <Link href="/dashboard/shipping/add" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                            <i className="fa fa-plus"></i> Add Your First Shipper
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {shippers.length > 0 && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                  <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving...' : 'Update Shipping Methods'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
