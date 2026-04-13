'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ImportJob {
  id: string;
  import_type: string;
  file_name: string;
  status: string;
  total_records: number;
  success_count: number;
  error_count: number;
  created_date: string;
  completed_date?: string;
}

export default function MarketingImportDonePage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImportJobs();
  }, []);

  const fetchImportJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/import-jobs');
      setJobs(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch import jobs:', err);
      setError('Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Import History</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading import history...</div>}

      {!loading && jobs.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Completed Imports ({jobs.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total Records</th>
                  <th>Success</th>
                  <th>Errors</th>
                  <th>Created</th>
                  <th>Completed</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.file_name}</td>
                    <td>{job.import_type}</td>
                    <td>
                      <span className={`label label-${getStatusClass(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.total_records}</td>
                    <td>
                      <span className="text-success">{job.success_count}</span>
                    </td>
                    <td>
                      {job.error_count > 0 ? (
                        <span className="text-danger">{job.error_count}</span>
                      ) : (
                        <span className="text-muted">{job.error_count}</span>
                      )}
                    </td>
                    <td>{formatDate(job.created_date)}</td>
                    <td>{job.completed_date ? formatDate(job.completed_date) : 'In Progress'}</td>
                    <td>
                      <Link href={`/marketing/import-done/${job.id}`} className="btn btn-xs btn-info">
                        <i className="fa fa-eye"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="alert alert-info">No import history found.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href="/marketing/import" className="btn btn-primary">
          <i className="fa fa-arrow-left"></i> Back to Import
        </Link>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'info';
    case 'failed':
      return 'danger';
    case 'partial':
      return 'warning';
    default:
      return 'default';
  }
}
