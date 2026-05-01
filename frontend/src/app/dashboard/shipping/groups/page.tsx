'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ShippingGroup {
  id: string;
  name: string;
  description: string;
  methods_count: number;
}

export default function ShippingGroupsPage() {
  const [groups, setGroups] = useState<ShippingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/shipping/groups');
      setGroups(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipping groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this shipping group? This cannot be undone.')) return;
    try {
      await api.delete(`/shipping/groups/${groupId}`);
      setSuccess('Shipping group deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading shipping groups...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-object-group" style={{ color: '#337ab7' }}></i> Shipping Groups</h1>
          <p className="text-muted">Manage shipping method groups. Groups let you assign shipping methods to specific products, categories, or conditions.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <Link href="/dashboard/shipping/groups/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Shipping Group
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-default">
            <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
              <h3 className="panel-title">
                <i className="fa fa-list" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                Shipping Groups
                {groups.length > 0 && <span className="badge" style={{ marginLeft: '8px', background: '#337ab7' }}>{groups.length}</span>}
              </h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Description</th>
                    <th className="text-center">Methods</th>
                    <th className="text-right" style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.length > 0 ? groups.map(group => (
                    <tr key={group.id}>
                      <td>
                        <Link href={`/dashboard/shipping/groups/edit/${group.id}`} style={{ fontWeight: 600 }}>
                          {group.name}
                        </Link>
                      </td>
                      <td className="text-muted">{group.description || '—'}</td>
                      <td className="text-center">
                        <span className="label label-info">{group.methods_count ?? '—'}</span>
                      </td>
                      <td className="text-right">
                        <Link href={`/dashboard/shipping/groups/edit/${group.id}`} className="btn btn-xs btn-info" title="Edit">
                          <i className="fa fa-edit"></i>
                        </Link>
                        {' '}
                        <button className="btn btn-xs btn-danger" onClick={() => handleDelete(group.id)} title="Delete">
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center" style={{ padding: '30px' }}>
                        <i className="fa fa-inbox" style={{ fontSize: '24px', color: '#ccc', display: 'block', marginBottom: '10px' }}></i>
                        <span className="text-muted">No shipping groups configured yet.</span>
                        <br />
                        <Link href="/dashboard/shipping/groups/add" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                          <i className="fa fa-plus"></i> Create Your First Group
                        </Link>
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
  );
}
