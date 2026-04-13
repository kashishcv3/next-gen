'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  joined_date: string;
}

export default function MemberSearchPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/members?${params.toString()}`);
      setMembers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to search members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
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
      <h1>Search Members</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Members</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-9">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
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

      <div style={{ marginBottom: '20px' }}>
        <Link href="/customers/members/add" className="btn btn-success">
          <i className="fa fa-plus"></i> Add Member
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Searching members...</div>}

      {!loading && members.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Results ({members.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`label label-${member.status === 'active' ? 'success' : 'default'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>{formatDate(member.joined_date)}</td>
                    <td>
                      <Link href={`/customers/members/edit/${member.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <Link href={`/customers/members/history/${member.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-history"></i> History
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && members.length === 0 && searchTerm && !error && (
        <div className="alert alert-info">No members found.</div>
      )}
    </div>
  );
}
