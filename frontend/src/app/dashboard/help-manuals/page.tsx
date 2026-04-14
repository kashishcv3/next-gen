'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface HelpManual {
  template: string;
  view: string;
}

export default function HelpManualsPage() {
  const [manuals, setManuals] = useState<HelpManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<string>('');

  useEffect(() => {
    loadManuals();
  }, []);

  const loadManuals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-tools/help-manuals');
      setManuals(response.data.data || []);
      setError(null);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedView(response.data.data[0].view || '');
      }
    } catch (err) {
      console.error('Failed to load help manuals:', err);
      setError('Failed to load help manuals');
      setManuals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(e.target.value);
  };

  const handleEditPage = () => {
    if (selectedView) {
      // In a real implementation, this would navigate to an edit page or open a modal
      alert(`Edit page for: ${selectedView}`);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-md-12">
          <h1>Help Manuals</h1>
        </div>
      </div>

      {error && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-12">
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-12">
            <div className="alert alert-info" role="alert">
              Loading help manuals...
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Select Help Page</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="viewSelect" className="control-label">
                    Available Help Pages
                  </label>
                  <select
                    id="viewSelect"
                    className="form-control"
                    value={selectedView}
                    onChange={handleViewChange}
                  >
                    <option value="">-- Select a help page --</option>
                    {manuals.map((manual, index) => (
                      <option key={index} value={manual.view}>
                        {manual.template} - {manual.view}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleEditPage}
                    disabled={!selectedView}
                  >
                    <i className="fa fa-edit"></i> Edit Page
                  </button>
                  <button
                    className="btn btn-default"
                    onClick={loadManuals}
                    style={{ marginLeft: '5px' }}
                  >
                    <i className="fa fa-refresh"></i> Refresh
                  </button>
                </div>
              </div>
            </div>

            {!loading && manuals.length === 0 && (
              <div className="panel panel-info">
                <div className="panel-heading">
                  <h3 className="panel-title">No Help Pages Available</h3>
                </div>
                <div className="panel-body">
                  <p>No help manual pages are currently available. Please contact your administrator.</p>
                </div>
              </div>
            )}

            {!loading && manuals.length > 0 && (
              <div className="panel panel-info" style={{ marginTop: '20px' }}>
                <div className="panel-heading">
                  <h3 className="panel-title">Available Pages ({manuals.length})</h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover table-condensed">
                    <thead>
                      <tr>
                        <th>Template</th>
                        <th>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manuals.map((manual, index) => (
                        <tr
                          key={index}
                          onClick={() => setSelectedView(manual.view)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor:
                              selectedView === manual.view ? '#f5f5f5' : 'transparent',
                          }}
                        >
                          <td>{manual.template}</td>
                          <td>{manual.view}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
