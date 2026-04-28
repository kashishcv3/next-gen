'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Store {
  id: number;
  name: string;
  is_live: string;
  domain: string;
}

export default function StoreStoreoptionsPage() {
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'offline'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stores/storeoptions');
        setAllStores(response.data.stores);
        setFilteredStores(response.data.stores);
      } catch (err) {
        setError('Failed to load store options');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = (stores: Store[], search: string, status: string) => {
    let filtered = stores;

    if (search) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(search.toLowerCase()) ||
          store.domain.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status === 'live') {
      filtered = filtered.filter((store) => store.is_live === 'y');
    } else if (status === 'offline') {
      filtered = filtered.filter((store) => store.is_live !== 'y');
    }

    setFilteredStores(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchTerm(search);
    applyFilters(allStores, search, filterStatus);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'all' | 'live' | 'offline';
    setFilterStatus(status);
    applyFilters(allStores, searchTerm, status);
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Store Options</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              className="form-control"
              placeholder="Search by store name or domain..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="form-control"
              value={filterStatus}
              onChange={handleStatusChange}
            >
              <option value="all">All Stores</option>
              <option value="live">Live Stores</option>
              <option value="offline">Offline Stores</option>
            </select>
          </div>
        </div>
      </div>

      <h3>Results ({filteredStores.length})</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No stores found matching your criteria
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.domain}</td>
                  <td>
                    <span
                      className={`label ${
                        store.is_live === 'y' ? 'label-success' : 'label-default'
                      }`}
                    >
                      {store.is_live === 'y' ? 'Live' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <a href={`/dashboard/store-changelog/${store.id}`} className="btn btn-xs btn-info">
                      View Log
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
