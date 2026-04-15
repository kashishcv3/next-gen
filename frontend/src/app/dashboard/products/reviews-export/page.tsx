'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function ProductReviewExportPage() {
  const [format, setFormat] = useState<string>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await api.post('/products/reviews/export', { format });
      setSuccess('Reviews exported successfully');
      // Handle file download if needed
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to export reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1><i className="fa fa-download"></i> Product Review Export</h1>
        <p><i className="fa fa-info-circle"></i> Export product reviews in various formats</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-8">
          <div className="well well-cv3-table">
            <div className="form-group">
              <label>Export Format</label>
              <select className="form-control" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </div></div>
        <div className="row"><div className="col-lg-8">
          <button type="submit" className="btn btn-primary" disabled={loading}><i className="fa fa-download"></i> {loading ? 'Exporting...' : 'Export Reviews'}</button>
        </div></div>
      </form>
    </div>
  );
}
