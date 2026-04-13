'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_date: string;
}

export default function CustomerSearchPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/customers?${params.toString()}`);
      setCustomers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to search customers:', err);
      setError('Failed to load customers');
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
      <h1>Search Customers</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search Criteria</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="search">Search by Name or Email</label>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter name or email..."
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div style={{ marginTop: '25px' }}>
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="fa fa-search"></i> Search
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCustomers([]);
                  }
                  style={{ marginLeft: '5px' }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Searching customers...</div>}

      {!loading && customers.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Results ({customers.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className={`label label-${customer.status === 'active' ? 'success' : 'default'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>{formatDate(customer.created_date)}</td>
                    <td>
                      <Link href={`/customers/history/${customer.id}`} className="btn btn-xs btn-info">
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

      {!loading && customers.length === 0 && searchTerm && !error && (
        <div className="alert alert-info">No customers found matching your criteria.</div>
      )}
    </div>
  );
}
