'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  file: File | null;
  delimiter: string;
  charset: string;
  filter_sku_regex: string;
  send_notification: boolean;
  notification_email: string;
}

export default function ProductImportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    file: null,
    delimiter: ',',
    charset: 'utf-8',
    filter_sku_regex: '',
    send_notification: false,
    notification_email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.file) {
        throw new Error('Please select a file');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('delimiter', formData.delimiter);
      formDataToSend.append('charset', formData.charset);
      formDataToSend.append('filter_sku_regex', formData.filter_sku_regex);
      formDataToSend.append('send_notification', formData.send_notification.toString());
      if (formData.send_notification) {
        formDataToSend.append('notification_email', formData.notification_email);
      }

      const response = await api.post('/products/import', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(`Import started successfully. ${response.data.message}`);
      setFormData({
        file: null,
        delimiter: ',',
        charset: 'utf-8',
        filter_sku_regex: '',
        send_notification: false,
        notification_email: '',
      });
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
          <h1>Import Products</h1>
          <p>
            <i className="fa fa-upload"></i> Upload a CSV or delimited file to import products.
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
                <h3 className="panel-title">Import Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Select File *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".csv,.txt,.xlsx"
                    onChange={handleFileChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Supported formats: CSV, TXT, XLSX
                  </small>
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
                    <option value="\t">Tab (\t)</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Character Set</label>
                  <select
                    className="form-control"
                    name="charset"
                    value={formData.charset}
                    onChange={handleInputChange}
                  >
                    <option value="utf-8">UTF-8</option>
                    <option value="iso-8859-1">ISO-8859-1</option>
                    <option value="windows-1252">Windows-1252</option>
                    <option value="ascii">ASCII</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Filter SKUs (Regex Pattern)</label>
                  <textarea
                    className="form-control"
                    name="filter_sku_regex"
                    value={formData.filter_sku_regex}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., ^PROD-.* to only import SKUs starting with PROD-"
                  />
                  <small className="form-text text-muted">
                    Optional regex pattern to filter products by SKU
                  </small>
                </div>

                <hr />

                <h4>Notifications</h4>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="send_notification"
                      checked={formData.send_notification}
                      onChange={handleInputChange}
                    />
                    Send notification email when import completes
                  </label>
                </div>

                {formData.send_notification && (
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="notification_email"
                      value={formData.notification_email}
                      onChange={handleInputChange}
                      required={formData.send_notification}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.file}
            >
              {loading ? 'Importing...' : 'Import Products'}
            </button>
            <a href="/products/list" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
