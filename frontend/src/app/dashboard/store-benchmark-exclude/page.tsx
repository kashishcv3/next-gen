'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function BenchmarkExcludePage() {
  const [excluded, setExcluded] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeStores = (arr: any[]): string[] => {
    if (!arr || arr.length === 0) return [];
    return arr.map((item: any) => (typeof item === 'string' ? item : item.name || item.store || String(item)));
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/benchmark-exclude');
      setExcluded(normalizeStores(res.data.excluded || []));
      setAvailable(normalizeStores(res.data.included || []));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const moveToExcluded = () => {
    const select = document.getElementById('nosel') as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions).map((o) => o.value);
    if (selected.length === 0) return;

    setAvailable(available.filter((s) => !selected.includes(s)));
    setExcluded([...excluded, ...selected].sort());
  };

  const moveToAvailable = () => {
    const select = document.getElementById('sel') as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions).map((o) => o.value);
    if (selected.length === 0) return;

    setExcluded(excluded.filter((s) => !selected.includes(s)));
    setAvailable([...available, ...selected].sort());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/stores/benchmark-exclude/save', {
        excluded_names: excluded,
      });
      setSuccess('Benchmark exclusion settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Benchmark Exclude</h1>
          <p>
            <i className="fa fa-info-circle"></i> Select live stores that you wish to exclude from the benchmark averages.
          </p>
        </div>
      </div>

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
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Benchmark Exclude</h3>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div>
                    <label>Excluded Stores</label>
                    <select
                      id="sel"
                      multiple
                      size={10}
                      className="form-control"
                      style={{ width: '300px' }}
                    >
                      {excluded.map((store) => (
                        <option key={store} value={store}>{store}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={moveToExcluded}
                    >
                      &lt;&lt;
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={moveToAvailable}
                    >
                      &gt;&gt;
                    </button>
                  </div>
                  <div>
                    <label>Available Stores</label>
                    <select
                      id="nosel"
                      multiple
                      size={10}
                      className="form-control"
                      style={{ width: '300px' }}
                    >
                      {available.map((store) => (
                        <option key={store} value={store}>{store}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-check"></i> Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
