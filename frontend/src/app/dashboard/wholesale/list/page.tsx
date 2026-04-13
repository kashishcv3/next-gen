'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Wholesale {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function WholesaleListPage() {
  const [wholesales, setWholesales] = useState<Wholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWholesales();
  }, []);

  const fetchWholesales = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/wholesale?${params.toString()}`);
      setWholesales(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch wholesale:', err);
      setError('Failed to load wholesale customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchWholesales(search);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === wholesales.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wholesales.map((w) => w.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
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
      <h1>Wholesale Customers</h1>

      {/* Search Panel */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Search & Filter</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="search">Search</label>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company name, contact, or email"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div style={{ marginTop: '25px' }}>
                <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
                  <i className="fa fa-search"></i> Search
                </button>
                <Link href="/wholesale/new-list" className="btn btn-success" style={{ marginLeft: '5px' }}>
                  <i className="fa fa-plus"></i> Add Wholesale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading wholesale customers...</div>}

      {!loading && wholesales.length > 0 && (
        <>
          {/* Bulk Actions */}
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-body">
              <div className="btn-group" role="group">
                <button className="btn btn-default" disabled={selectedItems.size === 0}>
                  <i className="fa fa-trash"></i> Delete Selected
                </button>
              </div>
              <span style={{ marginLeft: '20px', fontSize: '14px' }}>
                {selectedItems.size} of {wholesales.length} selected
              </span>
            </div>
          </div>

          {/* Results Table */}
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Wholesale Customers ({wholesales.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.size === wholesales.length && wholesales.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Company Name</th>
                    <th>Contact Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesales.map((wholesale) => (
                    <tr key={wholesale.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(wholesale.id)}
                          onChange={() => handleSelectItem(wholesale.id)}
                        />
                      </td>
                      <td>{wholesale.company_name}</td>
                      <td>{wholesale.contact_name}</td>
                      <td>{wholesale.email}</td>
                      <td>{wholesale.phone}</td>
                      <td>
                        <span className={`label label-${wholesale.status === 'active' ? 'success' : 'default'}`}>
                          {wholesale.status}
                        </span>
                      </td>
                      <td>{formatDate(wholesale.created_at)}</td>
                      <td>
                        <Link href={`/wholesale/view/${wholesale.id}`} className="btn btn-xs btn-primary">
                          View
                        </Link>
                        <Link href={`/wholesale/edit/${wholesale.id}`} className="btn btn-xs btn-warning" style={{ marginLeft: '3px' }}>
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && wholesales.length === 0 && !error && (
        <div className="alert alert-info">No wholesale customers found.</div>
      )}
    </div>
  );
}
