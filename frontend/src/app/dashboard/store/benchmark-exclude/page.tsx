'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ExcludedItem {
  id: string;
  order_id: string;
  reason: string;
  excluded_date: string;
}

export default function StoreBenchmarkExcludePage() {
  const [items, setItems] = useState<ExcludedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/store/benchmark-exclude');
      setItems(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Benchmark Exclude</h1>
          <p><i className="fa fa-info-circle"></i> Manage orders excluded from benchmarking.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-table"></i> Excluded Orders</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Order ID</th><th>Reason</th><th>Excluded Date</th></tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? items.map(item => (
                      <tr key={item.id}>
                        <td>{item.order_id}</td>
                        <td>{item.reason}</td>
                        <td>{new Date(item.excluded_date).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="text-center">No excluded orders</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
