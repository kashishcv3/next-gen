'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface WholesaleMember {
  id: string;
  company_name: string;
  contact_email: string;
  status: string;
  created_at: string;
}

export default function WholesaleListPage() {
  const [members, setMembers] = useState<WholesaleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async (searchTerm = '') => {
    try {
      const res = await api.get('/wholesale/members', {
        params: { search: searchTerm || undefined },
      });
      setMembers(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wholesale members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers(search);
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Delete this wholesale member?')) return;
    try {
      await api.delete(`/wholesale/members/${memberId}`);
      fetchMembers(search);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete member');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Wholesale Members</h1>
          <p><i className="fa fa-info-circle"></i> Manage wholesale member accounts.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSearch} className="form-inline">
            <input
              type="text"
              className="form-control"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary"><i className="fa fa-search"></i> Search</button>
            <Link href="/dashboard/wholesale/add" className="btn btn-success"><i className="fa fa-plus"></i> Add Member</Link>
          </form>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-list"></i> Wholesale Members</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Company</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {members.length > 0 ? members.map(member => (
                      <tr key={member.id}>
                        <td>{member.company_name}</td>
                        <td>{member.contact_email}</td>
                        <td><span className="label label-success">{member.status}</span></td>
                        <td>{new Date(member.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/dashboard/wholesale/edit/${member.id}`} className="btn btn-xs btn-info"><i className="fa fa-edit"></i></Link>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(member.id)}><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center">No wholesale members found</td></tr>
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
