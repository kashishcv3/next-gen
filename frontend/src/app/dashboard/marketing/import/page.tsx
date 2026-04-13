'use client';

import React, { useState, useRef } from 'react';
import api from '@/lib/api';

interface ImportOptions {
  file_name: string;
  file_size: number;
  import_type: 'campaigns' | 'emails' | 'contacts' | 'statistics';
  has_header: boolean;
  delimiter: ',' | ';' | '\t';
  encoding: 'utf-8' | 'iso-8859-1' | 'cp1252';
}

export default function MarketingImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Partial<ImportOptions>>({
    import_type: 'contacts',
    has_header: true,
    delimiter: ',',
    encoding: 'utf-8',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setOptions((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('import_type', options.import_type || 'contacts');
      formData.append('has_header', String(options.has_header));
      formData.append('delimiter', options.delimiter || ',');
      formData.append('encoding', options.encoding || 'utf-8');

      const response = await api.post('/marketing/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to import data:', err);
      setError('Failed to import data. Please check file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Import Marketing Data</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Data import started successfully! You will be notified when import is complete.</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Import File</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="file">Select File to Import *</label>
                <input
                  type="file"
                  className="form-control"
                  id="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  disabled={loading}
                />
                <p className="text-muted" style={{ marginTop: '10px' }}>
                  Supported formats: CSV, XLSX, JSON, TXT
                </p>
              </div>

              {file && (
                <div className="alert alert-info">
                  <strong>Selected File:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}

              <div className="panel panel-default" style={{ marginTop: '20px' }}>
                <div className="panel-heading">
                  <h3 className="panel-title">Import Settings</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label htmlFor="import_type">Import Type</label>
                    <select
                      className="form-control"
                      id="import_type"
                      name="import_type"
                      value={options.import_type}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="contacts">Contact Lists</option>
                      <option value="campaigns">Campaigns</option>
                      <option value="emails">Email Templates</option>
                      <option value="statistics">Statistics</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="delimiter">Delimiter</label>
                        <select
                          className="form-control"
                          id="delimiter"
                          name="delimiter"
                          value={options.delimiter}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value=",">Comma (,)</option>
                          <option value=";">Semicolon (;)</option>
                          <option value="\t">Tab</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="encoding">Encoding</label>
                        <select
                          className="form-control"
                          id="encoding"
                          name="encoding"
                          value={options.encoding}
                          onChange={handleChange}
                          disabled={loading}
                        >
                          <option value="utf-8">UTF-8</option>
                          <option value="iso-8859-1">ISO-8859-1</option>
                          <option value="cp1252">Windows-1252</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="has_header"
                        checked={options.has_header}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      File has header row
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleImport}
                  disabled={loading || !file}
                >
                  <i className="fa fa-upload"></i> Start Import
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    setError(null);
                  }
                  disabled={loading}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-undo"></i> Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Import Info</h3>
            </div>
            <div className="panel-body">
              <h4>File Status:</h4>
              {file ? (
                <p className="text-success">
                  <i className="fa fa-check-circle"></i> File selected
                </p>
              ) : (
                <p className="text-danger">
                  <i className="fa fa-times-circle"></i> No file selected
                </p>
              )}

              <hr />

              <h4>Configuration:</h4>
              <p>
                <strong>Type:</strong> {options.import_type}
              </p>
              <p>
                <strong>Delimiter:</strong> {options.delimiter === '\t' ? 'Tab' : options.delimiter}
              </p>
              <p>
                <strong>Encoding:</strong> {options.encoding}
              </p>
              <p>
                <strong>Header:</strong> {options.has_header ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
