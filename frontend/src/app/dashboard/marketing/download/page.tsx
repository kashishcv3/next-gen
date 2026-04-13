'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface DownloadItem {
  id: string;
  name: string;
  type: string;
  size: number;
  created_date: string;
  url: string;
}

export default function MarketingDownloadPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/downloads');
      setDownloads(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch downloads:', err);
      setError('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (item: DownloadItem) => {
    try {
      const response = await api.get(item.url, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Marketing Downloads</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading downloads...</div>}

      {!loading && downloads.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Available Downloads ({downloads.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{formatSize(item.size)}</td>
                    <td>{formatDate(item.created_date)}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-primary"
                        onClick={() => handleDownload(item)}
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

      {!loading && downloads.length === 0 && !error && (
        <div className="alert alert-info">No downloads available.</div>
      )}
    </div>
  );
}
