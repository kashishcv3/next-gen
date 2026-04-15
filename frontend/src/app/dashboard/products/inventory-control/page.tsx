'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function InventoryControlPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/products/inventory');
      setItems(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1><i className="fa fa-sitemap"></i> Inventory Control</h1>
        <p><i className="fa fa-info-circle"></i> Monitor and manage product inventory levels</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      <div className="row"><div className="col-lg-12">
        <div className="well well-cv3-table">
          <div className="table-responsive">
            <table className="table table-hover table-striped cv3-data-table">
              <thead><tr><th>Name</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={3} className="text-center">No items found</td></tr>
                ) : items.map((item: any, idx: number) => (
                  <tr key={idx}><td>{item.name || item.title || 'N/A'}</td><td>{item.status || 'Active'}</td><td className="text-right"><button className="btn btn-sm btn-default"><i className="fa fa-pencil"></i> Edit</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div></div>
    </div>
  );
}
