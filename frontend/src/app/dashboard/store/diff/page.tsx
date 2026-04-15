'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * Store Diff page.
 * Replicates old platform's store_diff.tpl exactly.
 * Shows diff between staging and live template/code files.
 */

export default function StoreDiffPage() {
  const { siteId } = useStore();

  const [filelist, setFilelist] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState('');
  const [diffOutput, setDiffOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [diffLoading, setDiffLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (siteId) fetchFilelist();
  }, [siteId]);

  const fetchFilelist = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-changelog/diff-filelist/${siteId}`);
      const data = res.data;
      setFilelist(data.filelist || {});

      // Select first file by default
      const files = Object.keys(data.filelist || {});
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load file list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setDiffLoading(true);
    setDiffOutput('');
    setError(null);

    try {
      const res = await api.post(`/store-changelog/diff/${siteId}`, {
        filename: selectedFile,
      });
      setDiffOutput(res.data.diff || 'No Differences Found Between Staging and Live');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get diff');
    } finally {
      setDiffLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Diff</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Diff output — shown above the form, matching old platform */}
      {diffOutput && (
        <pre>{diffOutput}</pre>
      )}

      {/* File selection form — matches old platform store_diff.tpl exactly */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="form-group">
              <label>Choose a template or file to see differences between staging and live</label>
              <select
                name="filename"
                className="form-control"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
              >
                {Object.entries(filelist).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6">
            <button type="submit" className="btn btn-primary" disabled={diffLoading || !selectedFile}>
              {diffLoading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
