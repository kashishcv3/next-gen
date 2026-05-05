'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

interface Member {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
}

interface ApiResponse {
  data: Member[];
}

export default function MemberSearchPage() {
  const { siteId } = useStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!siteId) {
      setError('Site ID not available. Please select a site.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);

      const params = new URLSearchParams({
        site_id: siteId.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await api.get<ApiResponse>(`/customers/members/search?${params.toString()}`);
      setMembers(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to search members:', err);
      setError(err.response?.data?.message || 'Failed to search members. Please try again.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Member Search</h1>
        </div>
      </div>
      <br />

      {/* Action Buttons */}
      <div className="row">
        <div className="col-lg-12">
          <Link href="/dashboard/customers/members/add" className="btn btn-success" style={{ marginRight: '10px' }}>
            <i className="fa fa-plus"></i> Add Member
          </Link>
          <Link href="/dashboard/customers/members/approve" className="btn btn-info">
            <i className="fa fa-check"></i> Approve Members
          </Link>
        </div>
      </div>
      <br />

      {/* Error Alert */}
      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="fa fa-search"></i> Search Members
              </h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSearch}>
                <div className="row">
                  <div className="col-md-9">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading || !siteId}
                    />
                  </div>
                  <div className="col-md-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={loading || !siteId}
                    >
                      <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
                      {loading ? ' Searching...' : ' Search'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <br />

      {/* Results Table */}
      {searched && !loading && members.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-list"></i> Search Results ({members.length})
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.user_id}>
                        <td>
                          {member.first_name} {member.last_name}
                          {member.active === false && (
                            <span className="label label-default" style={{ marginLeft: '8px' }}>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>{member.email}</td>
                        <td>
                          <Link
                            href={`/dashboard/customers/members/edit?id=${member.user_id}`}
                            className="btn btn-xs btn-warning"
                            title="Edit member"
                            data-toggle="tooltip"
                            data-placement="top"
                          >
                            <i className="fa fa-edit"></i>
                          </Link>
                          {' '}
                          <button
                            type="button"
                            className="btn btn-xs btn-info"
                            title="View member history"
                            data-toggle="tooltip"
                            data-placement="top"
                            onClick={() => {
                              // Placeholder for history modal/navigation
                              console.log('History for member:', member.user_id);
                            }}
                          >
                            <i className="fa fa-history"></i>
                          </button>
                          {' '}
                          <button
                            type="button"
                            className="btn btn-xs btn-default"
                            title="Manage member groups"
                            data-toggle="tooltip"
                            data-placement="top"
                            onClick={() => {
                              // Placeholder for groups modal/navigation
                              console.log('Groups for member:', member.user_id);
                            }}
                          >
                            <i className="fa fa-users"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searched && !loading && members.length === 0 && !error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info">
              <i className="fa fa-info-circle"></i> No members found matching your search criteria.
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info">
              <i className="fa fa-spinner fa-spin"></i> Searching members...
            </div>
          </div>
        </div>
      )}

      {/* Initial State - No Search Yet */}
      {!searched && !loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-warning">
              <i className="fa fa-search"></i> Enter a search term and click Search to find members.
            </div>
          </div>
        </div>
      )}

      {/* Site ID Not Available */}
      {!siteId && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">
              <strong>Error:</strong> No site selected. Please select a site before searching for members.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
