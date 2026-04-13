'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderFile {
  id: string;
  order_id: string;
  filename: string;
  file_type: string;
  size: number;
  created_at: string;
}

export default function OrderDownloadFilesPage() {
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/files');
      setFiles(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  };

  const handleDownload = (file: OrderFile) => {
    const link = document.createElement('a');
    link.href = `/api/v1/orders/files/${file.id}/download`;
    link.setAttribute('download', file.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSelected = () => {
    selectedFiles.forEach((fileId) => {
      const file = files.find((f) => f.id === fileId);
      if (file) {
        setTimeout(() => handleDownload(file), 100);
      }
    });
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
      <h1>Order Download Files</h1>
      <p className="text-muted">Download files associated with orders</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading files...</div>}

      {!loading && files.length > 0 && (
        <>
          <div className="panel panel-default" style={{ marginBottom: '20px' }}>
            <div className="panel-body">
              <button
                className="btn btn-primary"
                onClick={handleDownloadSelected}
                disabled={selectedFiles.size === 0}
              >
                <i className="fa fa-download"></i> Download Selected ({selectedFiles.size})
              </button>
            </div>
          </div>

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Files ({files.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>
                      <input
                        type="checkbox"
                        checked={selectedFiles.size === files.length && files.length > 0}
                        onChange={selectAll}
                      />
                    </th>
                    <th>Order ID</th>
                    <th>Filename</th>
                    <th style={{ width: '100px' }}>Type</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Size</th>
                    <th>Date</th>
                    <th style={{ width: '100px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFile(file.id)}
                        />
                      </td>
                      <td>{file.order_id}</td>
                      <td>{file.filename}</td>
                      <td>
                        <span className="label label-default">{file.file_type}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatFileSize(file.size)}</td>
                      <td>{formatDate(file.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => handleDownload(file)}
                        >
                          <i className="fa fa-download"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && files.length === 0 && !error && (
        <div className="alert alert-info">No files available for download.</div>
      )}
    </div>
  );
}
