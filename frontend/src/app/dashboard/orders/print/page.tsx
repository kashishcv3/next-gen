'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PrintJob {
  id: string;
  order_id: string;
  created_at: string;
  status: string;
  file_path: string;
}

export default function OrderPrintPage() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrintJobs();
  }, []);

  const fetchPrintJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/print-jobs');
      setPrintJobs(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch print jobs:', err);
      setError('Failed to load print jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (job: PrintJob) => {
    const link = document.createElement('a');
    link.href = job.file_path;
    link.download = `order-${job.order_id}-print.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Print Confirmation</h1>
      <p className="text-muted">Download and print your orders</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading print jobs...</div>}

      {!loading && printJobs.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Recent Print Jobs</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {printJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.order_id}</td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>
                      <span className={`label label-${job.status === 'ready' ? 'success' : 'warning'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleDownload(job)}
                      >
                        <i className="fa fa-download"></i> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && printJobs.length === 0 && !error && (
        <div className="alert alert-info">No print jobs available at this time.</div>
      )}

      {/* Information Panel */}
      <div className="panel panel-info" style={{ marginTop: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Print Information</h3>
        </div>
        <div className="panel-body">
          <p>Your orders have been prepared for printing. Click the download button to get your PDF files.</p>
          <p>You can then print these files directly from your computer or email them to your fulfillment center.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-primary">
          <i className="fa fa-download"></i> Download All
        </button>
        <button className="btn btn-default" style={{ marginLeft: '10px' }}>
          <i className="fa fa-times"></i> Cancel
        </button>
      </div>
    </div>
  );
}
