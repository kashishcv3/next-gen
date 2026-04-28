'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Site {
  id: number;
  name: string;
  domain: string;
  is_live: string;
  in_cloud: string;
  admin_host: string;
}

export default function StoreWhoWherePage() {
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'non-live'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stores/who-where');
        setAllSites(response.data.sites);
        setFilteredSites(response.data.sites);
      } catch (err) {
        setError('Failed to load server location data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (newFilter: 'all' | 'live' | 'non-live') => {
    setFilter(newFilter);
    let filtered = allSites;
    if (newFilter === 'live') {
      filtered = allSites.filter((site) => site.is_live === 'y');
    } else if (newFilter === 'non-live') {
      filtered = allSites.filter((site) => site.is_live !== 'y');
    }
    setFilteredSites(filtered);
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Server Locations - Who Where</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>Filter:</label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            name="filter"
            value="all"
            checked={filter === 'all'}
            onChange={() => handleFilterChange('all')}
          />
          All
        </label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            name="filter"
            value="live"
            checked={filter === 'live'}
            onChange={() => handleFilterChange('live')}
          />
          Live
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="non-live"
            checked={filter === 'non-live'}
            onChange={() => handleFilterChange('non-live')}
          />
          Non-Live
        </label>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>URI</th>
              <th>Domain</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No stores found
                </td>
              </tr>
            ) : (
              filteredSites.map((site) => (
                <tr key={site.id}>
                  <td>{site.name}</td>
                  <td>{site.admin_host}</td>
                  <td>{site.domain}</td>
                  <td>{site.in_cloud === 'y' ? 'Cloud' : 'On-Premises'}</td>
                  <td>{site.is_live === 'y' ? 'Live' : 'Offline'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
