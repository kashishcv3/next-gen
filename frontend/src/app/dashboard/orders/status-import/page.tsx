'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderStatusImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importStats, setImportStats] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/orders/import-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportStats(response.data.data);
      setSuccess(true);
      setFile(null);
      setError(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Import failed:', err);
      setError('Failed to import order status. Please check the file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Import Order Status</h1>
      <p className="text-muted">Update order statuses from a file</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          <strong>Status Import Successful!</strong>
          {importStats && (
            <ul style={{ marginTop: '10px' }}>
              <li>Orders Updated: {importStats.total_updated}</li>
              <li>Orders Skipped: {importStats.total_skipped}</li>
              <li>Errors: {importStats.total_errors}</li>
            </ul>
          )}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Upload Status File</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleImport}>
                <div className="form-group">
                  <label htmlFor="file">Select Import File</label>
                  <input
                    type="file"
                    className="form-control"
                    id="file"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.json,.xml"
                    required
                  />
                  <p className="help-block">
                    Supported formats: CSV, Excel (.xlsx), JSON, XML
                  </p>
                </div>

                {file && (
                  <div className="alert alert-info">
                    <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </div>
                )}

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i> Importing...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-upload"></i> Import Status
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">File Format</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Required Columns:</strong>
              </p>
              <ul>
                <li>order_id (unique identifier)</li>
                <li>status (new status)</li>
              </ul>

              <hr />

              <p>
                <strong>Optional Columns:</strong>
              </p>
              <ul>
                <li>tracking_number</li>
                <li>carrier</li>
                <li>notes</li>
                <li>updated_date</li>
              </ul>

              <hr />

              <p>
                <strong>Valid Status Values:</strong>
              </p>
              <ul>
                <li>pending</li>
                <li>processing</li>
                <li>shipped</li>
                <li>delivered</li>
                <li>cancelled</li>
                <li>completed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
