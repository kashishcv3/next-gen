'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface ChangeLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  info: string;
  sql_diff: string;
  timestamp: string | null;
}

export default function StoreChangelogPage() {
  const params = useParams();
  const siteId = parseInt(params.siteId as string);

  const [storeName, setStoreName] = useState('');
  const [changelog, setChangelog] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [recordCount, setRecordCount] = useState(100);
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);
  const [uniqueActions, setUniqueActions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/stores/changelog/${siteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStoreName(response.data.store_name);
        setChangelog(response.data.changelog);

        // Extract unique users and actions
        const users = [...new Set(response.data.changelog.map((c: ChangeLog) => c.username))];
        const actions = [...new Set(response.data.changelog.map((c: ChangeLog) => c.action))];
        setUniqueUsers(users.sort());
        setUniqueActions(actions.sort());
      } catch (err) {
        setError('Failed to load changelog data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  const filteredChangelog = changelog.filter((log) => {
    let matches = true;

    if (userFilter && log.username !== userFilter) {
      matches = false;
    }

    if (actionFilter && log.action !== actionFilter) {
      matches = false;
    }

    return matches;
  });

  const displayedChangelog = filteredChangelog.slice(0, recordCount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  if (!storeName) {
    return (
      <div className="container" style={{ marginTop: '20px' }}>
        <div className="alert alert-danger">Store not found</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Changelog - {storeName}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="userFilter">Filter by User</label>
            <select
              id="userFilter"
              className="form-control"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="actionFilter">Filter by Action</label>
            <select
              id="actionFilter"
              className="form-control"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-group">
            <label htmlFor="recordCount">Records to Display</label>
            <select
              id="recordCount"
              className="form-control"
              value={recordCount}
              onChange={(e) => setRecordCount(parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        Showing {displayedChangelog.length} of {filteredChangelog.length} records
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Info</th>
              <th>SQL Diff</th>
            </tr>
          </thead>
          <tbody>
            {displayedChangelog.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No changelog entries found
                </td>
              </tr>
            ) : (
              displayedChangelog.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</td>
                  <td>{log.username}</td>
                  <td>
                    <span className="label label-default">{log.action}</span>
                  </td>
                  <td>{log.info}</td>
                  <td>
                    {log.sql_diff && (
                      <code
                        style={{
                          display: 'block',
                          maxHeight: '100px',
                          overflow: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {log.sql_diff}
                      </code>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard/store-storeoptions" className="btn btn-default">
          Back to Store Options
        </a>
      </div>
    </div>
  );
}
