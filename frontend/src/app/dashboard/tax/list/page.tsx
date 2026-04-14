'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface TaxTable {
  id: string;
  name: string;
  state: string;
  rate: number;
  created_at: string;
}

export default function TaxListPage() {
  const [tables, setTables] = useState<TaxTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tax/tables');
      setTables(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tax tables');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!window.confirm('Delete this tax table?')) return;
    try {
      await api.delete(`/tax/tables/${tableId}`);
      fetchTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete table');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Tables</h1>
          <p><i className="fa fa-info-circle"></i> Manage state tax rates.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <Link href="/dashboard/tax/add" className="btn btn-primary"><i className="fa fa-plus"></i> Add Tax Table</Link>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-table"></i> Tax Tables</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Name</th><th>State</th><th>Rate (%)</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {tables.length > 0 ? tables.map(table => (
                      <tr key={table.id}>
                        <td>{table.name}</td>
                        <td>{table.state}</td>
                        <td>{(table.rate * 100).toFixed(2)}</td>
                        <td>{new Date(table.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/dashboard/tax/edit/${table.id}`} className="btn btn-xs btn-info"><i className="fa fa-edit"></i></Link>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(table.id)}><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center">No tax tables found</td></tr>
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
