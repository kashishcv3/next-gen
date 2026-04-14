'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface InventoryNotifyItem {
  product_id: number;
  product_name: string;
  email: string;
  notify_date: string;
  notified: boolean;
}

interface Report {
  total_requests: number;
  items: InventoryNotifyItem[];
}

export default function InventoryNotifyPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/inventory-notify');
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch inventory notifications:', err);
      setError('Failed to load inventory notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Inventory Notification Report</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading report...</div>}

      {!loading && report && (
        <>
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-body">
              <h4>Total Requests: {report.total_requests}</h4>
            </div>
          </div>

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Inventory Notification Requests</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Email</th>
                    <th>Request Date</th>
                    <th>Notified</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.email}</td>
                      <td>{new Date(item.notify_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`label label-${item.notified ? 'success' : 'warning'}`}>
                          {item.notified ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && report && report.items.length === 0 && (
        <div className="alert alert-info">No inventory notification requests.</div>
      )}
    </div>
  );
}
