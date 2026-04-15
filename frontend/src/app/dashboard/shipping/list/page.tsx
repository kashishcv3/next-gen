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
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [defaultMethod, setDefaultMethod] = useState<string>('');

  useEffect(() => {
    fetchShippers();
  }, []);

  const fetchShippers = async () => {
    try {
      const res = await api.get('/shipping/methods');
      const data = res.data.data || [];
      setShippers(data);

      // Initialize visibility state
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
    if (!window.confirm('Delete this shipping method?')) return;
    try {
      await api.delete(`/shipping/methods/${shipperId}`);
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
    try {
      const updates = shippers.map((shipper) => ({
        id: shipper.id,
        visible: visibility[shipper.id] ? 'y' : 'n',
        default_method: defaultMethod === shipper.id ? 'y' : 'n',
      }));
      await api.post('/shipping/methods/update-visibility', updates);
      fetchShippers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading shipping methods...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Shipping Tables</h1>
          <p><i className="fa fa-info-circle"></i> Add shippers, edit shipping tables, and configure your store's other shipping options.</p>
          <p><span className="label label-warning">Note</span> For shipping upgrades to work properly, shipping tables must be correctly prioritized with the "best" or highest method at the top.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <p>
        <Link href="/dashboard/shipping/add" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Add Shipper</Link>
        {' '}
        <Link href="/dashboard/shipping/groups" className="btn btn-primary btn-sm"><i className="fa fa-list"></i> View Shipping Groups</Link>
      </p>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSubmit}>
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Shipper</th>
                      <th className="text-center">Rate Tool</th>
                      <th className="text-center">Auto ID</th>
                      <th className="text-center">Import Code</th>
                      <th className="text-center">Visible</th>
                      <th className="text-center">Default</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippers.length > 0 ? shippers.map((shipper, index) => (
                      <tr key={shipper.id}>
                        <td>
                          <Link href={`/dashboard/shipping/edit/${shipper.id}`}>
                            {shipper.method}{shipper.admin_display ? ` (${shipper.admin_display})` : ''}
                          </Link>
                        </td>
                        <td className="text-center">{shipper.rate_tool}</td>
                        <td className="text-center">{shipper.auto_id}</td>
                        <td className="text-center">{shipper.code}</td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            name={`vis_${shipper.id}`}
                            checked={visibility[shipper.id] || false}
                            onChange={(e) => setVisibility({ ...visibility, [shipper.id]: e.target.checked })}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            name="default_method"
                            value={shipper.id}
                            checked={defaultMethod === shipper.id}
                            onChange={(e) => setDefaultMethod(e.target.value)}
                          />
                        </td>
                        <td className="text-right">
                          {index > 0 && (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-default"
                                onClick={() => handleMoveUp(shipper.id)}
                                title="Move Order Up"
                              >
                                <i className="fa fa-upload"></i>
                              </button>
                              {' '}
                            </>
                          )}
                          {shippers.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(shipper.id)}
                              title="Delete"
                            >
                              <i className="fa fa-trash-o"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="text-center">No shipping methods found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-center">
              <input type="submit" value="Update" className="btn btn-primary" />
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
