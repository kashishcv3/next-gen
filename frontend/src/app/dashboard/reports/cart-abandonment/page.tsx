'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AbandonmentRecord {
  customer_id: string;
  email: string;
  cart_value: number;
  items_count: number;
  abandoned_date: string;
  days_abandoned: number;
}

interface AbandonmentData {
  records: AbandonmentRecord[];
  total_abandoned_value: number;
}

export default function CartAbandonmentPage() {
  const [data, setData] = useState<AbandonmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/cart-abandonment');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load cart abandonment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Cart Abandonment Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Track abandoned shopping carts and recovery opportunities.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading cart abandonment data...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">Total Abandoned Value: ${data.total_abandoned_value.toFixed(2)}</div>
            </div>
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Email</th>
                      <th className="text-center">Cart Value</th>
                      <th className="text-center">Items</th>
                      <th>Abandoned Date</th>
                      <th className="text-center">Days Ago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.customer_id}</td>
                        <td>{record.email}</td>
                        <td align="center">${record.cart_value.toFixed(2)}</td>
                        <td align="center">{record.items_count}</td>
                        <td>{record.abandoned_date}</td>
                        <td align="center">{record.days_abandoned}</td>
                      </tr>
                    ))}
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
