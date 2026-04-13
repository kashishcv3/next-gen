'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface FileItem {
  id: string;
  name: string;
  size: number;
  created_at: string;
}

export default function WholesaleDownloadFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale/files');
      setFiles(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="alert alert-info">Loading files...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Download Wholesale Files</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Available Files</h3>
        </div>
        {files.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th style={{ width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{formatDate(file.created_at)}</td>
                    <td>
                      <a href={`/api/v1/wholesale/files/${file.id}/download`} className="btn btn-xs btn-primary">
                        <i className="fa fa-download"></i> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No files available for download.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link href="/wholesale/list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Wholesale
        </Link>
      </div>
    </div>
  );
}
