'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Subscriber {
  id: string;
  product_name: string;
  email: string;
  subscribed_date: string;
}

export default function ProductSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/subscribers');
      setSubscribers(response.data.data || []);
    } catch (err) {
      setError('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Subscribers</h1>
          <p><i className="fa fa-bell"></i> View product subscribers.</p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Subscribers ({subscribers.length})</h3>
              </div>
              <div className="panel-body">
                {subscribers.length === 0 ? (
                  <p className="text-muted">No subscribers found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Email</th>
                        <th>Subscribed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(sub => (
                        <tr key={sub.id}>
                          <td>{sub.product_name}</td>
                          <td>{sub.email}</td>
                          <td>{sub.subscribed_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
