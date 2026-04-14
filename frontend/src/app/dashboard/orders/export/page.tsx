'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ExportOption {
  value: string;
  label: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Comma-separated values - Excel compatible'
  },
  {
    value: 'excel',
    label: 'Excel (XLSX)',
    description: 'Microsoft Excel workbook format'
  },
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Portable Document Format - ready to print'
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'JavaScript Object Notation - for integrations'
  },
];

export default function OrderExportPage() {
  const searchParams = useSearchParams();
  const siteId = searchParams.get('site_id') || '1';

  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setExporting(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('site_id', siteId);
      params.append('format', selectedFormat);
      params.append('date_from', startDate);
      params.append('date_to', endDate);
      if (status) params.append('status', status);

      // Simulate export - in real implementation, this would call an API endpoint
      // const response = await api.get(`/orders/export?${params.toString()}`, {
      //   responseType: 'blob'
      // });

      const blob = new Blob(['Order export data'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.${selectedFormat === 'excel' ? 'xlsx' : selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Export Orders</h1>
      <p className="text-muted">
        <i className="fa fa-info-circle"></i> Download your orders in multiple formats for integration with external systems.
      </p>
      <hr />

      {success && (
        <div className="alert alert-success">
          <i className="fa fa-check-circle"></i> Orders exported successfully! Check your downloads.
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="fa fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-download"></i> Export Options</h3>
            </div>
            <div className="panel-body">
              {/* Format Selection */}
              <div className="form-group">
                <label><strong>Export Format:</strong></label>
                <div style={{ marginTop: '10px' }}>
                  {exportOptions.map((option) => (
                    <div key={option.value} style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0' }}>
                        <input
                          type="radio"
                          name="format"
                          value={option.value}
                          checked={selectedFormat === option.value}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          style={{ marginTop: '5px', marginRight: '10px' }}
                        />
                        <div>
                          <strong>{option.label}</strong>
                          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                            {option.description}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                <h4>Filter Criteria</h4>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="startDate">Start Date:</label>
                      <input
                        type="date"
                        id="startDate"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="endDate">End Date:</label>
                      <input
                        type="date"
                        id="endDate"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Order Status (Optional):</label>
                  <select
                    id="status"
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Export Button */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <i className={`fa fa-${exporting ? 'spinner fa-spin' : 'download'}`}></i>
                  {exporting ? ' Exporting...' : ' Export Orders'}
                </button>
                <Link href="/dashboard/orders/list" className="btn btn-default btn-lg" style={{ marginLeft: '10px' }}>
                  <i className="fa fa-arrow-left"></i> Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-lightbulb-o"></i> Export Information</h3>
            </div>
            <div className="panel-body">
              <h5>CSV Format</h5>
              <p>
                Best for importing into spreadsheet applications or other systems. Includes all order details and line items.
              </p>

              <h5>Excel Format</h5>
              <p>
                Formatted spreadsheet with multiple sheets for orders, customers, and line items. Ready for analysis.
              </p>

              <h5>PDF Format</h5>
              <p>
                Print-ready invoices and packing slips. Professional format for customer communication.
              </p>

              <h5>JSON Format</h5>
              <p>
                Structured data format ideal for API integrations, webhooks, and custom applications.
              </p>

              <div className="alert alert-info" style={{ marginTop: '15px', marginBottom: '0' }}>
                <small>
                  <i className="fa fa-info-circle"></i> Exports are limited to 10,000 orders at a time. Use date filters to narrow results.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
