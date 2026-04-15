'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MyAccountPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/accounts/me');
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load account data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1><i className="fa fa-user"></i> My Account</h1>
        <p><i className="fa fa-info-circle"></i> View and manage your account information</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      <div className="row"><div className="col-lg-12">
        <div className="well well-cv3-table">
          {data && (
            <div>
              <p><strong>Account Information:</strong></p>
              <pre style={{maxHeight: '400px', overflowY: 'auto'}}>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
          {!data && !error && (
            <p className="text-muted">Account information will appear here.</p>
          )}
        </div>
      </div></div>
    </div>
  );
}
