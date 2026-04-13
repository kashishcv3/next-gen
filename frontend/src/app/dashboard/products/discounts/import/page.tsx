'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  file: File | null;
  delimiter: string;
}

export default function ProductDiscountImportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    file: null,
    delimiter: ',',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files?.[0] || null,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.file) throw new Error('Please select a file');

      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('delimiter', formData.delimiter);

      const response = await api.post('/products/discounts/import', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(response.data.message || 'Discounts imported successfully');
      setFormData({ file: null, delimiter: ',' });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Import Discounts</h1>
          <p>
            <i className="fa fa-upload"></i> Upload a CSV file to import discounts.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Import Discounts</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Select File *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Delimiter</label>
                  <select
                    className="form-control"
                    name="delimiter"
                    value={formData.delimiter}
                    onChange={handleInputChange}
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import Discounts'}
            </button>
            <a href="/products/discounts" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
