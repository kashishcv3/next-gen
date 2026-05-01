'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function RewardsListPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchRewards(); }, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/reports/rewards');
      setRewards(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const columns = rewards.length > 0 ? Object.keys(rewards[0]) : [];

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-gift" style={{ color: '#f0ad4e' }}></i> Rewards Program</h1>
          <p className="text-muted">Manage customer rewards points and program settings.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <span className="label label-warning" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-gift"></i> Total Rewards Entries: {total}
          </span>
          <button className="btn btn-default btn-sm" onClick={fetchRewards} style={{ marginLeft: '10px' }}>
            <i className="fa fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading rewards...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #f0ad4e' }}>
                <h3 className="panel-title">
                  <i className="fa fa-trophy" style={{ color: '#f0ad4e', marginRight: '8px' }}></i>
                  Customer Rewards
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        {columns.length > 0 ? columns.map(col => (
                          <th key={col} style={{ fontWeight: 600 }}>
                            {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </th>
                        )) : <th>No Data</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.length > 0 ? rewards.map((item, idx) => (
                        <tr key={idx}>
                          {columns.map(col => (
                            <td key={col}>{item[col] != null ? String(item[col]) : '—'}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={columns.length || 1} className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                            No rewards data found. The rewards program may not be active for this store.
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
