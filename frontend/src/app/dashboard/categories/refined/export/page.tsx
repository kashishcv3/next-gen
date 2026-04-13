'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function CategoryRefinedExportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/categories/refined/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `refined-categories-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild?.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Export Refined Categories</h1>
          <p><i className="fa fa-download"></i> Export refined categories as CSV.</p>
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

      <div className="row">
        <div className="col-lg-8">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">Export Settings</h3>
            </div>
            <div className="panel-body">
              <p>Click the button below to export all refined categories.</p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export'}
          </button>
          <a href="/categories/refined" className="btn btn-default">
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
