'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface GiftCertificateItem {
  certificate_id: number;
  amount: number;
  recipient_email: string;
  created_date: string;
  used_date?: string;
  status: string;
}

interface Report {
  period: string;
  total_issued: number;
  total_value: number;
  items: GiftCertificateItem[];
}

export default function GiftCardsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/gift-certificates?period=${period}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch gift certificates:', err);
      setError('Failed to load gift certificates report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Gift Certificates Report</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div className="btn-group" role="group">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                className={`btn ${period === p ? 'btn-primary' : 'btn-default'}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading report...</div>}

      {!loading && report && (
        <>
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-6">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Issued</h4>
                  <h2>{report.total_issued}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="panel panel-default">
                <div className="panel-body">
                  <h4>Total Value</h4>
                  <h2>${report.total_value.toFixed(2)}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Gift Certificates</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Amount</th>
                    <th>Issued</th>
                    <th>Used</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item) => (
                    <tr key={item.certificate_id}>
                      <td>{item.recipient_email}</td>
                      <td>${item.amount.toFixed(2)}</td>
                      <td>{new Date(item.created_date).toLocaleDateString()}</td>
                      <td>{item.used_date ? new Date(item.used_date).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`label label-${item.status === 'used' ? 'success' : item.status === 'expired' ? 'danger' : 'info'}`}>
                          {item.status}
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
        <div className="alert alert-info">No gift certificates for the selected period.</div>
      )}
    </div>
  );
}
