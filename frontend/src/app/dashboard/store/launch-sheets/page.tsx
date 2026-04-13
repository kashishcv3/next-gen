'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface LaunchSheet {
  id: string;
  name: string;
  created_at: string;
  status: string;
}

export default function LaunchSheetsPage() {
  const [sheets, setSheets] = useState<LaunchSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await api.get('/store/launch-sheets');
      setSheets(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load launch sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sheetId: string) => {
    if (!window.confirm('Are you sure you want to delete this sheet?')) return;

    try {
      await api.delete(`/store/launch-sheets/${sheetId}`);
      fetchSheets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete sheet');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Launch Sheets</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage store launch sheets.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-list"></i> Launch Sheets
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.length > 0 ? (
                      sheets.map(sheet => (
                        <tr key={sheet.id}>
                          <td>{sheet.name}</td>
                          <td><span className={`label label-${sheet.status === 'active' ? 'success' : 'default'}`}>{sheet.status}</span></td>
                          <td>{new Date(sheet.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/store/launch-sheets/${sheet.id}`} className="btn btn-xs btn-info">
                              <i className="fa fa-eye"></i> View
                            </Link>
                            {' '}
                            <button
                              className="btn btn-xs btn-danger"
                              onClick={() => handleDelete(sheet.id)}
                            >
                              <i className="fa fa-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center">No launch sheets found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
