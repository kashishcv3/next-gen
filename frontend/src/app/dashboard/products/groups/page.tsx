'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ProductGroup {
  id: string;
  name: string;
  product_count: number;
}

export default function ProductGroupsPage() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/groups');
      setGroups(response.data.data || []);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await api.delete(`/products/groups/${groupId}`);
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Groups</h1>
          <p><i className="fa fa-object-group"></i> Manage product groups.</p>
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

      <div className="row">
        <div className="col-lg-12">
          <Link href="/products/groups/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Group
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Product Groups ({groups.length})</h3>
              </div>
              <div className="panel-body">
                {groups.length === 0 ? (
                  <p className="text-muted">No groups found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Products</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => (
                        <tr key={group.id}>
                          <td>{group.name}</td>
                          <td><span className="badge">{group.product_count}</span></td>
                          <td>
                            <Link href={`/products/groups/edit/${group.id}`} className="btn btn-sm btn-default">
                              Edit
                            </Link>
                            <button onClick={() => handleDelete(group.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
