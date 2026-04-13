'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface ExportOptions {
  include_campaigns: boolean;
  include_emails: boolean;
  include_contacts: boolean;
  include_statistics: boolean;
  format: 'csv' | 'json' | 'xlsx';
  date_from?: string;
  date_to?: string;
}

export default function MarketingExportPage() {
  const [options, setOptions] = useState<ExportOptions>({
    include_campaigns: true,
    include_emails: true,
    include_contacts: true,
    include_statistics: true,
    format: 'csv',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setOptions((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await api.post('/marketing/export', options, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `marketing-export-${new Date().toISOString().split('T')[0]}.${options.format}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to export marketing data:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Export Marketing Data</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Data exported successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Export Configuration</h3>
            </div>
            <div className="panel-body">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">Data to Export</h3>
                </div>
                <div className="panel-body">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="include_campaigns"
                        checked={options.include_campaigns}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      Include Campaign Data
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="include_emails"
                        checked={options.include_emails}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      Include Email Templates
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="include_contacts"
                        checked={options.include_contacts}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      Include Contact Lists
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="include_statistics"
                        checked={options.include_statistics}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      Include Statistics
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="format">Export Format</label>
                <select
                  className="form-control"
                  id="format"
                  name="format"
                  value={options.format}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="csv">CSV (Comma Separated Values)</option>
                  <option value="json">JSON (JavaScript Object Notation)</option>
                  <option value="xlsx">XLSX (Excel)</option>
                </select>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="date_from">Date From (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date_from"
                      name="date_from"
                      value={options.date_from || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="date_to">Date To (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date_to"
                      name="date_to"
                      value={options.date_to || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleExport}
                  disabled={loading}
                >
                  <i className="fa fa-download"></i> Export Data
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Export Summary</h3>
            </div>
            <div className="panel-body">
              <h4>Selected Items:</h4>
              <ul>
                {options.include_campaigns && <li>Campaigns</li>}
                {options.include_emails && <li>Email Templates</li>}
                {options.include_contacts && <li>Contact Lists</li>}
                {options.include_statistics && <li>Statistics</li>}
              </ul>
              <hr />
              <p>
                <strong>Format:</strong> {options.format.toUpperCase()}
              </p>
              {(options.date_from || options.date_to) && (
                <p>
                  <strong>Date Range:</strong> {options.date_from} to {options.date_to}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
