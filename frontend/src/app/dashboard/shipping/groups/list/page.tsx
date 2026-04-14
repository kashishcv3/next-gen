'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ShippingGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ShippingGroupsPage() {
  const [groups, setGroups] = useState<ShippingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!window.confirm('Delete this shipping group?')) return;
    try {
      await api.delete(`/shipping/groups/${groupId}`);
      fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete group');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Shipping Groups</h1>
          <p><i className="fa fa-info-circle"></i> Manage shipping method groups.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <Link href="/dashboard/shipping/groups/add" className="btn btn-primary"><i className="fa fa-plus"></i> Add Group</Link>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-list"></i> Shipping Groups</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {groups.length > 0 ? groups.map(group => (
                      <tr key={group.id}>
                        <td>{group.name}</td>
                        <td>{group.description}</td>
                        <td>{new Date(group.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/dashboard/shipping/groups/edit/${group.id}`} className="btn btn-xs btn-info"><i className="fa fa-edit"></i></Link>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(group.id)}><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center">No shipping groups found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
