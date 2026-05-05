'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StoreOption {
  id: number;
  name: string;
}

interface DeveloperOption {
  uid: number;
  username: string;
  co_name: string;
}

export default function StoreMovePagePage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [developers, setDevelopers] = useState<DeveloperOption[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/move-options');
      setStores(res.data.sites || []);
      setDevelopers(res.data.developers || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!selectedStore || !selectedDeveloper) {
      setError('Please select both a store and a user');
      return;
    }

    try {
      const res = await api.post('/stores/move', {
        site_id: parseInt(selectedStore),
        uid: parseInt(selectedDeveloper),
      });
      setSuccess(res.data.message || 'Store moved successfully');
      setSelectedStore('');
      setSelectedDeveloper('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to move store');
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
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Store Move</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Store to Move</label>
                  <select
                    className="form-control"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                  >
                    <option value="">-- Select a Store --</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>User to Move To</label>
                  <select
                    className="form-control"
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                  >
                    <option value="">-- Select a User --</option>
                    {developers.map((dev) => (
                      <option key={dev.uid} value={dev.uid}>
                        {dev.username} ({dev.co_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-exchange"></i> Move Store
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
