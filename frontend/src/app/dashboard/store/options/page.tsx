'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StoreOption {
  id: string;
  key: string;
  value: string;
  description: string;
}

export default function StoreOptionsPage() {
  const [options, setOptions] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/store/options');
      setOptions(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load store options');
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = options.filter(opt =>
    opt.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Options</h1>
          <p>
            <i className="fa fa-info-circle"></i> View and manage store configuration options.
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

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-table"></i> Store Options Mapping
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map(opt => (
                        <tr key={opt.id}>
                          <td><code>{opt.key}</code></td>
                          <td><code>{opt.value}</code></td>
                          <td>{opt.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center">No options found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
