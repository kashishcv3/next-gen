'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SiteInfo {
  store: string;
  suri: string;
  bob: string;
  sessions: string;
  is_live: string;
}

interface DbGroup {
  db_name: string;
  live_count: number;
  test_count: number;
  sites: SiteInfo[];
}

export default function WhoWherePage() {
  const [dbGroups, setDbGroups] = useState<DbGroup[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'nonlive'>('all');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/who-where');
      const sites = res.data.sites || [];

      // Group sites by admin_host (database server)
      const groups: Record<string, SiteInfo[]> = {};
      sites.forEach((site: any) => {
        const host = site.admin_host || 'unknown';
        if (!groups[host]) groups[host] = [];
        groups[host].push({
          store: site.name || '',
          suri: site.domain || '',
          bob: site.in_cloud === 'y' ? 'Cloud' : '',
          sessions: '',
          is_live: site.is_live || 'n',
        });
      });

      const dbGroupList: DbGroup[] = Object.entries(groups).map(([db, dbSites]) => ({
        db_name: db.replace('.colormaria.net', ''),
        live_count: dbSites.filter((s) => s.is_live === 'y').length,
        test_count: dbSites.filter((s) => s.is_live !== 'y').length,
        sites: dbSites,
      }));

      setDbGroups(dbGroupList);
      setTotal(sites.length);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSites = (sites: SiteInfo[]) => {
    if (filter === 'live') return sites.filter((s) => s.is_live === 'y');
    if (filter === 'nonlive') return sites.filter((s) => s.is_live !== 'y');
    return sites;
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
          <h1>Who? Where?</h1>
          <p>
            <i className="fa fa-info-circle"></i> Do you need to know which database server a store is on? If so, you came to the right place.
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

      {/* Filter Controls */}
      <div className="row">
        <div className="col-lg-12 text-center">
          <label className="radio-inline"><strong>Show:</strong></label>
          <label className="radio-inline">
            <input
              type="radio"
              name="option"
              checked={filter === 'all'}
              onChange={() => setFilter('all')}
            /> <strong>All</strong>
          </label>
          <label className="radio-inline">
            <input
              type="radio"
              name="option"
              checked={filter === 'live'}
              onChange={() => setFilter('live')}
            /> <strong>Live Stores</strong>
          </label>
          <label className="radio-inline">
            <input
              type="radio"
              name="option"
              checked={filter === 'nonlive'}
              onChange={() => setFilter('nonlive')}
            /> <strong>Non-Live Stores</strong>
          </label>
        </div>
      </div>

      <br />

      {/* DB Server Tables */}
      <div className="row">
        <div className="col-lg-12">
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table>
                <tbody>
                  <tr style={{ verticalAlign: 'top' }}>
                    {dbGroups.map((group) => {
                      const filteredSites = getFilteredSites(group.sites);
                      if (filteredSites.length === 0 && filter !== 'all') return null;
                      return (
                        <td key={group.db_name} style={{ padding: '0 10px' }}>
                          <table className="table table-hover table-striped cv3-data-table text-center">
                            <thead>
                              <tr>
                                <th colSpan={2}>
                                  {group.db_name} (live: {group.live_count} test: {group.test_count})
                                </th>
                                <th>BoB</th>
                                <th>Sessions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredSites.map((site, idx) => (
                                <tr key={idx}>
                                  <td className="text-left">{site.store}</td>
                                  <td>
                                    {site.suri && (
                                      <a href={`https://${site.suri}`} target="_blank" rel="noopener noreferrer">
                                        {site.suri}
                                      </a>
                                    )}
                                  </td>
                                  <td className="text-left">{site.bob}</td>
                                  <td className="text-left">{site.sessions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
