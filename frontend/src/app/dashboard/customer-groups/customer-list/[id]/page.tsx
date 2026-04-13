'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function GroupCustomerListPage() {
  const params = useParams();
  const groupId = params.id as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [groupId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customer-groups/${groupId}/customers`);
      setCustomers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Group Customers</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading customers...</div>}

      {!loading && customers.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Customers ({customers.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && customers.length === 0 && !error && (
        <div className="alert alert-info">No customers in this group.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/customer-groups/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Groups
        </Link>
      </div>
    </div>
  );
}
