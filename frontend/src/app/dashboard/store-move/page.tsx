'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface Store {
  id: number;
  name: string;
}

interface Developer {
  uid: number;
  username: string;
  co_name: string;
}

export default function StoreMovePagePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/stores/move-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(response.data.sites);
        setDevelopers(response.data.developers);
      } catch (err) {
        setError('Failed to load store and developer data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !selectedDeveloper) {
      setError('Please select both a store and a developer');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/stores/move`,
        {
          site_id: parseInt(selectedStore),
          uid: parseInt(selectedDeveloper),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmitMessage('Store moved successfully');
      setSelectedStore('');
      setSelectedDeveloper('');
    } catch (err) {
      setError('Failed to move store');
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">
        <div className="col-md-8">
          <h1>Move Store</h1>

          {error && <div className="alert alert-danger">{error}</div>}
          {submitMessage && <div className="alert alert-success">{submitMessage}</div>}

          <form onSubmit={handleSubmit} className="form-horizontal">
            <div className="form-group">
              <label htmlFor="store" className="col-sm-2 control-label">
                Store
              </label>
              <div className="col-sm-10">
                <select
                  id="store"
                  className="form-control"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  <option value="">-- Select a store --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="developer" className="col-sm-2 control-label">
                Target User
              </label>
              <div className="col-sm-10">
                <select
                  id="developer"
                  className="form-control"
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                >
                  <option value="">-- Select a developer --</option>
                  {developers.map((dev) => (
                    <option key={dev.uid} value={dev.uid}>
                      {dev.username} ({dev.co_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button type="submit" className="btn btn-primary">
                  Move Store
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
