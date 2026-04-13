'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface ExportOptions {
  include_sent: boolean;
  include_draft: boolean;
  include_stats: boolean;
  format: 'csv' | 'xlsx' | 'json';
  date_from?: string;
  date_to?: string;
}

export default function ExportPage() {
  const [options, setOptions] = useState<ExportOptions>({
    include_sent: true,
    include_draft: false,
    include_stats: true,
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

      const response = await api.post('/campaigns/export', options, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `campaigns-export-${new Date().toISOString().split('T')[0]}.${options.format}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to export campaigns:', err);
      setError('Failed to export campaigns');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Export Campaigns</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Campaigns exported successfully!</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Export Configuration</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label>Campaign Types</label>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_sent"
                      checked={options.include_sent}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include Sent Campaigns
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_draft"
                      checked={options.include_draft}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include Draft Campaigns
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_stats"
                      checked={options.include_stats}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include Statistics
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="format">Export Format</label>
                <select
                  className="form-control"
                  id="format"
                  name="format"
                  value={options.format}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="date_from">Date From</label>
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
                    <label htmlFor="date_to">Date To</label>
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

              <button
                className="btn btn-primary btn-lg"
                onClick={handleExport}
                disabled={loading}
              >
                <i className="fa fa-download"></i> Export Campaigns
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Export Summary</h3>
            </div>
            <div className="panel-body">
              <h4>Selected Items:</h4>
              <ul>
                {options.include_sent && <li>Sent Campaigns</li>}
                {options.include_draft && <li>Draft Campaigns</li>}
                {options.include_stats && <li>Statistics</li>}
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
