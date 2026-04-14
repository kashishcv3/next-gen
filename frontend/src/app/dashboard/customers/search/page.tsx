'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function CustomerSearchPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/accounts/customers', {
        params: { search: search || undefined },
      });
      setCustomers(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.delete(`/accounts/customers/${customerId}`);
      setCustomers(customers.filter(c => c.id !== customerId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Customer Search</h1>
          <p><i className="fa fa-info-circle"></i> Search and manage customer accounts.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="input-group-btn">
                <button type="submit" className="btn btn-primary"><i className="fa fa-search"></i> Search</button>
                <Link href="/dashboard/customers/add" className="btn btn-success"><i className="fa fa-plus"></i> Add Customer</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
      <br />

      {(loading || customers.length > 0) && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-list"></i> Customer Results</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Email</th><th>Name</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center">Loading...</td></tr>
                    ) : customers.length > 0 ? (
                      customers.map(customer => (
                        <tr key={customer.id}>
                          <td>{customer.email}</td>
                          <td>{customer.first_name} {customer.last_name}</td>
                          <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/dashboard/customers/info/${customer.id}`} className="btn btn-xs btn-info"><i className="fa fa-eye"></i></Link>
                            <Link href={`/dashboard/customers/edit/${customer.id}`} className="btn btn-xs btn-warning"><i className="fa fa-edit"></i></Link>
                            <button className="btn btn-xs btn-danger" onClick={() => handleDelete(customer.id)}><i className="fa fa-trash"></i></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="text-center">No customers found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
