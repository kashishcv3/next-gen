'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface ExportOptions {
  include_active: boolean;
  include_inactive: boolean;
  include_history: boolean;
  format: 'csv' | 'xlsx' | 'json';
}

export default function CustomerExportPage() {
  const [options, setOptions] = useState<ExportOptions>({
    include_active: true,
    include_inactive: true,
    include_history: false,
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

      const response = await api.post('/customers/export', options, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `customers-export-${new Date().toISOString().split('T')[0]}.${options.format}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to export customers:', err);
      setError('Failed to export customer data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Export Customers</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Customers exported successfully!</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Export Configuration</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label>Customer Types</label>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_active"
                      checked={options.include_active}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include Active Customers
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_inactive"
                      checked={options.include_inactive}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include Inactive Customers
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="include_history"
                      checked={options.include_history}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    Include History
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

              <button
                className="btn btn-primary btn-lg"
                onClick={handleExport}
                disabled={loading}
              >
                <i className="fa fa-download"></i> Export Customers
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
                {options.include_active && <li>Active Customers</li>}
                {options.include_inactive && <li>Inactive Customers</li>}
                {options.include_history && <li>Customer History</li>}
              </ul>
              <hr />
              <p>
                <strong>Format:</strong> {options.format.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
