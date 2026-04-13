'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CatalogFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  format: string;
  status: string;
}

export default function OrderCatalogDownloadPage() {
  const [files, setFiles] = useState<CatalogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalogFiles();
  }, []);

  const fetchCatalogFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/catalog-files');
      setFiles(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch catalog files:', err);
      setError('Failed to load catalog files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (file: CatalogFile) => {
    const link = document.createElement('a');
    link.href = `/api/v1/orders/catalog-files/${file.id}/download`;
    link.setAttribute('download', file.name);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Catalog Download</h1>
      <p className="text-muted">Download previously exported catalog files</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading catalog files...</div>}

      {!loading && files.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Available Catalog Files ({files.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th style={{ width: '100px' }}>Format</th>
                  <th style={{ textAlign: 'right', width: '100px' }}>Size</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>
                      <span className="label label-default">{file.format.toUpperCase()}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatFileSize(file.size)}</td>
                    <td>{formatDate(file.created_at)}</td>
                    <td>
                      <span className={`label label-${file.status === 'ready' ? 'success' : 'warning'}`}>
                        {file.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => handleDownload(file)}
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

      {!loading && files.length === 0 && !error && (
        <div className="alert alert-info">No catalog files available. Export a catalog to create a file.</div>
      )}
    </div>
  );
}
