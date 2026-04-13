'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_date: string;
  last_activity: string;
}

export default function CustomerInfoPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomerInfo();
  }, [customerId]);

  const fetchCustomerInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/${customerId}`);
      setCustomer(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch customer:', err);
      setError('Failed to load customer information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading customer info...</div>;
  }

  if (!customer) {
    return <div className="alert alert-danger">Customer not found</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>{customer.name}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Customer Information</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Name:</strong> {customer.name}
              </p>
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
              <p>
                <strong>Phone:</strong> {customer.phone}
              </p>
              <p>
                <strong>Status:</strong> <span className={`label label-${customer.status === 'active' ? 'success' : 'default'}`}>{customer.status}</span>
              </p>
              <p>
                <strong>Created:</strong> {formatDate(customer.created_date)}
              </p>
              <p>
                <strong>Last Activity:</strong> {formatDate(customer.last_activity)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Actions</h3>
            </div>
            <div className="panel-body">
              <Link href={`/customers/history/${customer.id}`} className="btn btn-block btn-primary" style={{ marginBottom: '5px' }}>
                <i className="fa fa-history"></i> View History
              </Link>
              <Link href={`/customers/search`} className="btn btn-block btn-default">
                <i className="fa fa-arrow-left"></i> Back to Customers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
