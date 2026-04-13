'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface WholesaleData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function WholesaleViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wholesale, setWholesale] = useState<WholesaleData | null>(null);

  useEffect(() => {
    fetchWholesale();
  }, [id]);

  const fetchWholesale = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wholesale/${id}`);
      setWholesale(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch wholesale:', err);
      setError('Failed to load wholesale customer');
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

  if (loading) {
    return <div className="alert alert-info">Loading...</div>;
  }

  if (error || !wholesale) {
    return <div className="alert alert-danger">{error || 'Wholesale customer not found'}</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>View Wholesale Customer</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">{wholesale.company_name}</h3>
          <div style={{ marginTop: '10px' }}>
            <Link href={`/wholesale/edit/${wholesale.id}`} className="btn btn-warning btn-sm">
              <i className="fa fa-edit"></i> Edit
            </Link>
            <Link href="/wholesale/list" className="btn btn-default btn-sm" style={{ marginLeft: '5px' }}>
              Back to List
            </Link>
          </div>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <h4>Company Information</h4>
              <table className="table table-condensed">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '150px' }}>Company Name:</td>
                    <td>{wholesale.company_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Contact Name:</td>
                    <td>{wholesale.contact_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Email:</td>
                    <td>{wholesale.email}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Phone:</td>
                    <td>{wholesale.phone}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Status:</td>
                    <td>
                      <span className={`label label-${wholesale.status === 'active' ? 'success' : 'default'}`}>
                        {wholesale.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <h4>Address Information</h4>
              <table className="table table-condensed">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '150px' }}>Address:</td>
                    <td>{wholesale.address}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>City:</td>
                    <td>{wholesale.city}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>State:</td>
                    <td>{wholesale.state}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Postal Code:</td>
                    <td>{wholesale.postal_code}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Country:</td>
                    <td>{wholesale.country}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr />

          <div className="row">
            <div className="col-md-12">
              <h4>Metadata</h4>
              <table className="table table-condensed">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '150px' }}>ID:</td>
                    <td>{wholesale.id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Created At:</td>
                    <td>{formatDate(wholesale.created_at)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Updated At:</td>
                    <td>{formatDate(wholesale.updated_at)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
