'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ShippingTable {
  id: string;
  name: string;
  carrier: string;
  rate_type: string;
  created_at: string;
}

export default function ShippingListPage() {
  const [tables, setTables] = useState<ShippingTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/shipping/tables');
      setTables(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shipping tables');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!window.confirm('Delete this shipping table?')) return;
    try {
      await api.delete(`/shipping/tables/${tableId}`);
      fetchTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete table');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Shipping Tables</h1>
          <p><i className="fa fa-info-circle"></i> Manage shipping rate tables.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <Link href="/shipping/add" className="btn btn-primary"><i className="fa fa-plus"></i> Add Shipping Table</Link>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-table"></i> Shipping Tables</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Name</th><th>Carrier</th><th>Rate Type</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {tables.length > 0 ? tables.map(table => (
                      <tr key={table.id}>
                        <td>{table.name}</td>
                        <td>{table.carrier}</td>
                        <td>{table.rate_type}</td>
                        <td>{new Date(table.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/shipping/edit/${table.id}`} className="btn btn-xs btn-info"><i className="fa fa-edit"></i></Link>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(table.id)}><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center">No shipping tables found</td></tr>
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
