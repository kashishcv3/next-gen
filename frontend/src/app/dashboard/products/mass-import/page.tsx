'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function MassProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/products/mass-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Products imported successfully');
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1><i className="fa fa-upload"></i> Mass Product Import</h1>
        <p><i className="fa fa-info-circle"></i> Import multiple products at once using a CSV or Excel file</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-8">
          <div className="well well-cv3-table">
            <div className="form-group">
              <label>Select File to Import</label>
              <input type="file" className="form-control" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
              <p className="text-muted" style={{marginTop:'10px'}}>Supported formats: CSV, Excel (XLSX, XLS)</p>
            </div>
          </div>
        </div></div>
        <div className="row"><div className="col-lg-8">
          <button type="submit" className="btn btn-primary" disabled={loading}><i className="fa fa-upload"></i> {loading ? 'Importing...' : 'Import Products'}</button>
        </div></div>
      </form>
    </div>
  );
}
