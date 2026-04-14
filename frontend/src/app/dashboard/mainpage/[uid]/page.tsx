'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Company {
  site_id: number;
  name: string;
  display_name: string;
  is_live: string;
  domain: string;
  secure_domain: string;
  in_cloud: string;
  date_created: string;
  bill: string;
  bill_note: string;
}

interface MainpageData {
  uid: number;
  username: string;
  co_name: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  companies: Company[];
  login_page_messages: any[];
}

export default function MainpagePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MainpageData | null>(null);

  useEffect(() => {
    fetchMainpageData();
  }, [uid]);

  const fetchMainpageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/mainpage/${uid}`);
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching mainpage:', err);
      setError(err.response?.data?.detail || 'Failed to load mainpage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-warning">No data available</div>
      </div>
    );
  }

  const developerName = data.co_name || `${data.first_name} ${data.last_name}`.trim() || data.username;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>
        {developerName}'s Stores
      </h1>

      <div className="well">
        <p>
          <strong>Username:</strong> {data.username}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
        {data.co_name && (
          <p>
            <strong>Company:</strong> {data.co_name}
          </p>
        )}
        <p>
          <strong>User Type:</strong> {data.user_type}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary">
          New Store
        </button>
      </div>

      {data.companies.length === 0 ? (
        <div className="alert alert-info">
          No stores found for this developer.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Display Name</th>
                <th>Status</th>
                <th>Domain</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map((company) => (
                <tr key={company.site_id}>
                  <td>
                    <Link href={`/dashboard/links/${company.site_id}`}>
                      {company.name}
                    </Link>
                  </td>
                  <td>{company.display_name}</td>
                  <td>
                    <span
                      className={`label ${
                        company.is_live === 'y' ? 'label-success' : 'label-default'
                      }`}
                    >
                      {company.is_live === 'y' ? 'Live' : 'Dev'}
                    </span>
                  </td>
                  <td>
                    {company.domain && (
                      <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                        {company.domain}
                      </a>
                    )}
                  </td>
                  <td>{company.date_created}</td>
                  <td>
                    <Link href={`/dashboard/links/${company.site_id}`} className="btn btn-sm btn-info">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
