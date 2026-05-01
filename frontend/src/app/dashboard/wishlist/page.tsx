'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchWishlists(); }, []);

  const fetchWishlists = async () => {
    try {
      const res = await api.get('/reports/wishlists');
      setWishlists(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically get column headers from data
  const columns = wishlists.length > 0 ? Object.keys(wishlists[0]) : [];

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-heart" style={{ color: '#d9534f' }}></i> Customer Wishlists</h1>
          <p className="text-muted">View customer wish lists and saved items.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <span className="label label-info" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-heart"></i> Total Wishlists: {total}
          </span>
          <button className="btn btn-default btn-sm" onClick={fetchWishlists} style={{ marginLeft: '10px' }}>
            <i className="fa fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading wishlists...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #d9534f' }}>
                <h3 className="panel-title">
                  <i className="fa fa-heart" style={{ color: '#d9534f', marginRight: '8px' }}></i>
                  Wishlists
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
                      {wishlists.length > 0 ? wishlists.map((item, idx) => (
                        <tr key={idx}>
                          {columns.map(col => (
                            <td key={col}>{item[col] != null ? String(item[col]) : '—'}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={columns.length || 1} className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                            No wishlists found. Customers haven&apos;t created any wishlists yet.
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
