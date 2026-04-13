'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export default function SearchGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/customer-groups?${params.toString()}`);
      setGroups(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to search groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Search Customer Groups</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search</h3>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Searching groups...</div>}

      {!loading && groups.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Results ({groups.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.description}</td>
                    <td>{group.member_count}</td>
                    <td>
                      <Link href={`/customer-groups/edit/${group.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && groups.length === 0 && searchTerm && !error && (
        <div className="alert alert-info">No groups found.</div>
      )}
    </div>
  );
}
