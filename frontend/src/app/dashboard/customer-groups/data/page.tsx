'use client';

import React, { useState, useCallback } from 'react';
import api from '@/lib/api';

interface Customer {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface SearchResponse {
  data: Customer[];
}

export default function CustomerDataPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Search for customers by email
   */
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchEmail.trim()) {
      setError('Please enter an email address to search');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setHasSearched(true);

    try {
      const response = await api.get<SearchResponse>('/customers/data/search', {
        params: {
          email: searchEmail.trim(),
        },
      });

      setCustomers(response.data.data || []);
      if ((response.data.data || []).length === 0) {
        setSuccessMessage('No customers found matching that email.');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to search customers. Please try again.';
      setError(errorMsg);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchEmail]);

  /**
   * Open customer detail in a popup window
   */
  const handleViewDetail = useCallback((userId: number, email: string) => {
    const detailUrl = `/dashboard/customer-groups/data/${userId}`;
    window.open(detailUrl, `customer_${userId}`, 'width=800,height=600,resizable=yes,scrollbars=yes');
  }, []);

  /**
   * Download customer data as CSV
   */
  const handleDownload = useCallback(async (customer: Customer) => {
    try {
      const response = await api.get(`/customers/data/${customer.user_id}`);
      const customerData = response.data.data || customer;

      // Prepare CSV content
      const csvContent = [
        ['Field', 'Value'],
        ['User ID', customerData.user_id?.toString() || ''],
        ['Email', customerData.email || ''],
        ['First Name', customerData.first_name || ''],
        ['Last Name', customerData.last_name || ''],
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `customer_${customer.user_id}_${customer.email}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage(`Downloaded data for ${customer.email}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to download customer data';
      setError(errorMsg);
    }
  }, []);

  /**
   * Delete a customer with confirmation
   */
  const handleDelete = useCallback(async (customer: Customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the customer account for ${customer.email}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/customers/data/${customer.user_id}`);
      setSuccessMessage(`Customer ${customer.email} has been deleted successfully.`);

      // Remove from list
      setCustomers((prev) => prev.filter((c) => c.user_id !== customer.user_id));

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete customer. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1 style={{ marginBottom: '10px' }}>
            <i className="fa fa-user-circle" style={{ color: '#337ab7', marginRight: '8px' }}></i>
            Customer Data
          </h1>
          <p className="text-muted">This module allows you to search for customer data by email.</p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="row" style={{ marginBottom: '15px' }}>
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
              <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="row" style={{ marginBottom: '15px' }}>
          <div className="col-lg-12">
            <div className="alert alert-success alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
              {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="fa fa-search" style={{ marginRight: '8px' }}></i>
                Customer Data Search
              </h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label htmlFor="emailInput">Email Address</label>
                  <input
                    id="emailInput"
                    type="text"
                    className="form-control"
                    placeholder="Enter customer email (e.g., john@example.com)"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ marginRight: '8px' }}
                >
                  {loading ? (
                    <>
                      <i className="fa fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-search" style={{ marginRight: '6px' }}></i>
                      Search
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => {
                    setSearchEmail('');
                    setCustomers([]);
                    setError(null);
                    setSuccessMessage(null);
                    setHasSearched(false);
                  }}
                  disabled={loading}
                >
                  <i className="fa fa-times" style={{ marginRight: '6px' }}></i>
                  Clear
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-table" style={{ marginRight: '8px' }}></i>
                  Search Results {customers.length > 0 && `(${customers.length})`}
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                {customers.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr style={{ background: '#f9f9f9' }}>
                          <th style={{ fontWeight: 600 }}>Email</th>
                          <th style={{ fontWeight: 600 }}>First Name</th>
                          <th style={{ fontWeight: 600 }}>Last Name</th>
                          <th style={{ fontWeight: 600 }}>Customer ID</th>
                          <th style={{ fontWeight: 600, width: '240px', textAlign: 'center' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.user_id}>
                            <td>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleViewDetail(customer.user_id, customer.email);
                                }}
                                style={{ color: '#337ab7', textDecoration: 'none' }}
                              >
                                {customer.email}
                              </a>
                            </td>
                            <td>{customer.first_name || '—'}</td>
                            <td>{customer.last_name || '—'}</td>
                            <td>
                              <span className="label label-default">{customer.user_id}</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-xs btn-primary"
                                onClick={() => handleDownload(customer)}
                                disabled={loading}
                                style={{ marginRight: '4px' }}
                                title="Download customer data as CSV"
                              >
                                <i className="fa fa-download"></i> Download
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-danger"
                                onClick={() => handleDelete(customer)}
                                disabled={loading}
                                title="Delete this customer"
                              >
                                <i className="fa fa-trash"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                    <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                    <p>No customers found. Try searching with a different email address.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial state message */}
      {!hasSearched && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-body" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <i className="fa fa-search fa-3x" style={{ marginBottom: '15px', opacity: 0.5 }}></i>
                <p>Enter a customer email address above and click "Search" to get started.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
