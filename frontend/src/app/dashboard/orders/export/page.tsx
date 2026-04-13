'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderExportPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateFrom || !dateTo) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await api.get('/orders/export', {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          format: exportFormat,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-export.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setDateFrom('');
      setDateTo('');
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Export</h1>
      <p className="text-muted">Export orders for a specific date range</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Orders exported successfully!</div>}

      <div className="panel panel-default" style={{ maxWidth: '600px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Export Settings</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={handleExport}>
            <div className="form-group">
              <label htmlFor="dateFrom">Start Date</label>
              <input
                type="date"
                className="form-control"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateTo">End Date</label>
              <input
                type="date"
                className="form-control"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="format">Export Format</label>
              <select
                className="form-control"
                id="format"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
            </div>

            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Exporting...
                  </>
                ) : (
                  <>
                    <i className="fa fa-download"></i> Export Orders
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Information Panel */}
      <div className="panel panel-info" style={{ marginTop: '20px', maxWidth: '600px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Export Information</h3>
        </div>
        <div className="panel-body">
          <ul className="list-unstyled">
            <li><strong>CSV:</strong> Comma-separated values, compatible with Excel</li>
            <li><strong>Excel:</strong> Microsoft Excel format (.xlsx)</li>
            <li><strong>PDF:</strong> Formatted document suitable for printing</li>
            <li><strong>JSON:</strong> Structured data format for integration</li>
            <li><strong>XML:</strong> Standard XML format for data exchange</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
