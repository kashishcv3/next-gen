'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface MOMBuilderOptions {
  mom_builder_delimiter?: string;
  mom_builder_qualifier?: string;
  mom_builder_five_prods?: string;
  mom_builder_gift_cert_lineitem?: string;
  mom_builder_file_extension?: string;
}

interface MOMBuilderLine {
  line_number: number;
  information: string;
}

export default function MOMBuilderPage() {
  const [options, setOptions] = useState<MOMBuilderOptions>({
    mom_builder_delimiter: ',',
    mom_builder_qualifier: 'y',
    mom_builder_five_prods: 'y',
    mom_builder_gift_cert_lineitem: 'n',
    mom_builder_file_extension: 'dat',
  });

  const [actionMode, setActionMode] = useState<string>('none');
  const [formatName, setFormatName] = useState('');
  const [loadFormatName, setLoadFormatName] = useState('');
  const [insertLines, setInsertLines] = useState(1);
  const [insertPosition, setInsertPosition] = useState('before');
  const [insertLineNumber, setInsertLineNumber] = useState(1);
  const [moveLineNumber, setMoveLineNumber] = useState(1);
  const [movePosition, setMovePosition] = useState('before');
  const [moveBeforeLineNumber, setMoveBeforeLineNumber] = useState(1);
  const [deleteMode, setDeleteMode] = useState('checked');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [momLines, setMOMLines] = useState<MOMBuilderLine[]>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/orders/mom-builder');
      const data = res.data.data || res.data || {};
      setOptions((prev) => ({ ...prev, ...data }));
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(
        typeof d === 'string'
          ? d
          : Array.isArray(d)
            ? d.map((x: any) => x.msg).join(', ')
            : 'Failed to load MOM Builder options'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      await api.post('/orders/mom-builder', options);
      setSuccess('MOM Builder configuration saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(
        typeof d === 'string'
          ? d
          : Array.isArray(d)
            ? d.map((x: any) => x.msg).join(', ')
            : 'Failed to save configuration'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderRadio = (
    name: string,
    label: string,
    value: string,
    radioOptions?: { value: string; label: string }[],
    helpText?: string
  ) => {
    const opts = radioOptions || [
      { value: 'y', label: 'Yes' },
      { value: 'n', label: 'No' },
    ];
    return (
      <div className="form-group" style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>
          {label}
        </label>
        {opts.map((opt) => (
          <label key={opt.value} className="radio-inline" style={{ marginRight: '15px' }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => handleChange(name, opt.value)}
              disabled={saving}
            />
            {opt.label}
          </label>
        ))}
        {helpText && (
          <p className="help-block">
            <small className="text-muted">{helpText}</small>
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p>
          <i className="fa fa-spinner fa-spin"></i> Loading MOM Builder settings...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>
            <i className="fa fa-cogs" style={{ color: '#337ab7', marginRight: '8px' }}></i>
            Configure MOM Export
          </h1>
          <p className="text-muted">Use the following form to create a custom MOM export.</p>
          <a href="#" className="btn btn-primary btn-sm" style={{ marginBottom: '20px' }}>
            <i className="fa fa-cog"></i> Configure Catalog Request Export
          </a>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">
              <i className="fa fa-check-circle"></i> {success}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Options
                </h3>
              </div>
              <div className="panel-body">
                {renderRadio(
                  'mom_builder_delimiter',
                  'File Delimiter',
                  options.mom_builder_delimiter || ',',
                  [
                    { value: ',', label: 'Comma' },
                    { value: 't', label: 'Tab' },
                  ],
                  "This must be 'Comma' for standard MOM exports"
                )}

                {renderRadio(
                  'mom_builder_qualifier',
                  'Include Text Qualifier',
                  options.mom_builder_qualifier || 'y',
                  [
                    { value: 'y', label: 'Yes' },
                    { value: 'n', label: 'No' },
                  ],
                  'Use "" around each field to signify the data is part of the same field. This must be \'Yes\' for standard MOM exports'
                )}

                {renderRadio(
                  'mom_builder_five_prods',
                  'Export Five Products Per Line',
                  options.mom_builder_five_prods || 'y',
                  [
                    { value: 'y', label: 'Yes' },
                    { value: 'n', label: 'No' },
                  ],
                  "This must be 'Yes' for standard MOM exports"
                )}

                {renderRadio(
                  'mom_builder_gift_cert_lineitem',
                  'Include Gift Certificate as Line Item',
                  options.mom_builder_gift_cert_lineitem || 'n',
                  [
                    { value: 'y', label: 'Yes' },
                    { value: 'n', label: 'No' },
                  ]
                )}

                {renderRadio(
                  'mom_builder_file_extension',
                  'File Export Extension',
                  options.mom_builder_file_extension || 'dat',
                  [
                    { value: 'dat', label: '.dat' },
                    { value: 'txt', label: '.txt' },
                  ]
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Actions
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Action Mode
                  </label>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="none"
                        checked={actionMode === 'none'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      None (default)
                    </label>
                  </div>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="save"
                        checked={actionMode === 'save'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      Backup current format as:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Format name"
                      value={formatName}
                      onChange={(e) => setFormatName(e.target.value)}
                      disabled={saving || actionMode !== 'save'}
                      style={{ maxWidth: '500px', marginTop: '4px' }}
                    />
                  </div>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="load"
                        checked={actionMode === 'load'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      Load saved format:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Format name"
                      value={loadFormatName}
                      onChange={(e) => setLoadFormatName(e.target.value)}
                      disabled={saving || actionMode !== 'load'}
                      style={{ maxWidth: '500px', marginTop: '4px' }}
                    />
                  </div>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="insert"
                        checked={actionMode === 'insert'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      Insert lines:
                    </label>
                    <div
                      style={{
                        marginTop: '8px',
                        marginLeft: '20px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <select
                        className="form-control"
                        value={insertLines}
                        onChange={(e) => setInsertLines(parseInt(e.target.value))}
                        disabled={saving || actionMode !== 'insert'}
                        style={{ maxWidth: '80px' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <select
                        className="form-control"
                        value={insertPosition}
                        onChange={(e) => setInsertPosition(e.target.value)}
                        disabled={saving || actionMode !== 'insert'}
                        style={{ maxWidth: '100px' }}
                      >
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </select>
                      <span style={{ marginTop: '6px' }}>line</span>
                      <input
                        type="number"
                        className="form-control"
                        value={insertLineNumber}
                        onChange={(e) => setInsertLineNumber(parseInt(e.target.value))}
                        disabled={saving || actionMode !== 'insert'}
                        style={{ maxWidth: '80px' }}
                      />
                    </div>
                  </div>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="move"
                        checked={actionMode === 'move'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      Move line:
                    </label>
                    <div
                      style={{
                        marginTop: '8px',
                        marginLeft: '20px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <span>line</span>
                      <input
                        type="number"
                        className="form-control"
                        value={moveLineNumber}
                        onChange={(e) => setMoveLineNumber(parseInt(e.target.value))}
                        disabled={saving || actionMode !== 'move'}
                        style={{ maxWidth: '80px' }}
                      />
                      <select
                        className="form-control"
                        value={movePosition}
                        onChange={(e) => setMovePosition(e.target.value)}
                        disabled={saving || actionMode !== 'move'}
                        style={{ maxWidth: '100px' }}
                      >
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </select>
                      <span>line</span>
                      <input
                        type="number"
                        className="form-control"
                        value={moveBeforeLineNumber}
                        onChange={(e) => setMoveBeforeLineNumber(parseInt(e.target.value))}
                        disabled={saving || actionMode !== 'move'}
                        style={{ maxWidth: '80px' }}
                      />
                    </div>
                  </div>

                  <div className="radio" style={{ marginBottom: '12px' }}>
                    <label>
                      <input
                        type="radio"
                        name="actionMode"
                        value="delete"
                        checked={actionMode === 'delete'}
                        onChange={(e) => setActionMode(e.target.value)}
                        disabled={saving}
                      />
                      Delete:
                    </label>
                    <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                      <label className="radio">
                        <input
                          type="radio"
                          name="deleteMode"
                          value="checked"
                          checked={deleteMode === 'checked'}
                          onChange={(e) => setDeleteMode(e.target.value)}
                          disabled={saving || actionMode !== 'delete'}
                        />
                        Lines checked below
                      </label>
                      <label className="radio">
                        <input
                          type="radio"
                          name="deleteMode"
                          value="all"
                          checked={deleteMode === 'all'}
                          onChange={(e) => setDeleteMode(e.target.value)}
                          disabled={saving || actionMode !== 'delete'}
                        />
                        All lines
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Line</th>
                      <th>Information</th>
                      <th style={{ width: '80px' }}>Edit</th>
                      <th style={{ width: '80px' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {momLines.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center" style={{ padding: '20px' }}>
                          <p className="text-muted">No export lines configured</p>
                        </td>
                      </tr>
                    ) : (
                      momLines.map((line) => (
                        <tr key={line.line_number}>
                          <td>
                            <strong>{line.line_number}</strong>
                          </td>
                          <td>{line.information}</td>
                          <td>
                            <button type="button" className="btn btn-sm btn-default">
                              <i className="fa fa-edit"></i>
                            </button>
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-danger">
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-12">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
