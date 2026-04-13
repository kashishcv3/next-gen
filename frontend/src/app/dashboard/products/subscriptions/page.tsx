'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Subscription {
  id: string;
  product_name: string;
  frequency: string;
  price: string;
  status: string;
}

export default function ProductSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/subscriptions');
      setSubscriptions(response.data.data || []);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Subscription Products</h1>
          <p><i className="fa fa-refresh"></i> Manage subscription products.</p>
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
                <h3 className="panel-title">Subscriptions ({subscriptions.length})</h3>
              </div>
              <div className="panel-body">
                {subscriptions.length === 0 ? (
                  <p className="text-muted">No subscription products found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Frequency</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map(sub => (
                        <tr key={sub.id}>
                          <td>{sub.product_name}</td>
                          <td>{sub.frequency}</td>
                          <td>${parseFloat(sub.price).toFixed(2)}</td>
                          <td><span className="badge">{sub.status}</span></td>
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
