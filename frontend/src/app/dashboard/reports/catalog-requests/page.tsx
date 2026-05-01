'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CatalogRequestsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/reports/catalog-requests', { params: { period } });
      const d = res.data.data || res.data;
      setRecords(d.records || []);
      setTotal(d.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load catalog requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-book" style={{ color: '#337ab7' }}></i> Catalog Requests Report</h1>
          <p className="text-muted">View and track catalog request submissions from customers.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-6">
          <div className="btn-group">
            {['day', 'week', 'month', 'year', 'all'].map(p => (
              <button key={p} className={`btn ${period === p ? 'btn-primary' : 'btn-default'}`}
                onClick={() => setPeriod(p)}>
                {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-6 text-right">
          <span className="label label-info" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-list"></i> Total: {total}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading catalog requests...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-table" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Catalog Requests
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        {records.length > 0 ? (
                          Object.keys(records[0]).map(key => (
                            <th key={key} style={{ background: '#f9f9f9', fontWeight: 600 }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))
                        ) : (
                          <th>No Data</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {records.length > 0 ? records.map((record, idx) => (
                        <tr key={idx}>
                          {Object.values(record).map((val: any, i) => (
                            <td key={i}>{val != null ? String(val) : '—'}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                            No catalog requests found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
