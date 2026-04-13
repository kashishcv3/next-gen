'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface CustomerGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_date: string;
  status: string;
}

export default function CustomerGroupsListPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await api.get(`/customer-groups?${params.toString()}`);
      setGroups(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load customer groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchGroups(searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/customer-groups/${id}`);
        fetchGroups(searchTerm);
      } catch (err) {
        console.error('Failed to delete group:', err);
        setError('Failed to delete group');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Customer Groups</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Groups</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-9">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by group name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                <i className="fa fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/customer-groups/list" className="btn btn-success" style={{ marginRight: '10px' }}>
            <i className="fa fa-plus"></i> Create Group
          </Link>
          <Link href="/customer-groups/merge" className="btn btn-info">
            <i className="fa fa-object-group"></i> Merge Groups
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading customer groups...</div>}

      {!loading && groups.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Customer Groups ({groups.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '250px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.description}</td>
                    <td>{group.member_count}</td>
                    <td>
                      <span className={`label label-${group.status === 'active' ? 'success' : 'default'}`}>
                        {group.status}
                      </span>
                    </td>
                    <td>{formatDate(group.created_date)}</td>
                    <td>
                      <Link href={`/customer-groups/edit/${group.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <Link href={`/customer-groups/customer-list/${group.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-users"></i> Members
                      </Link>
                      <Link href={`/customer-groups/data/${group.id}`} className="btn btn-xs btn-primary">
                        <i className="fa fa-database"></i> Data
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(group.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && groups.length === 0 && !error && (
        <div className="alert alert-info">No customer groups found.</div>
      )}
    </div>
  );
}
