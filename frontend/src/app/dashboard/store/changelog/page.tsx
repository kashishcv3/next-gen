'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * Store Change Log page.
 * Replicates old platform's store_changelog.tpl exactly.
 * Queries change_log table in per-store DB via Log_Class::get().
 */

interface LogEntry {
  user_id: string;
  action: string;
  specific_information: string;
  difference: string;
  ndate: string;
}

export default function StoreChangelogPage() {
  const { siteId } = useStore();

  const [log, setLog] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [actions, setActions] = useState<Record<string, string>>({});
  const [isBigadmin, setIsBigadmin] = useState(false);
  const [logDifference, setLogDifference] = useState('n');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filters
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterLast, setFilterLast] = useState('30');

  // Popover state
  const [activePopover, setActivePopover] = useState<number | null>(null);

  useEffect(() => {
    if (siteId) fetchChangelog();
  }, [siteId]);

  const fetchChangelog = async (
    userFilter = filterUser,
    actionFilter = filterAction,
    lastFilter = filterLast
  ) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (userFilter) params.user_filter = userFilter;
      if (actionFilter) params.action_filter = actionFilter;
      if (lastFilter) params.last = lastFilter;

      const res = await api.get(`/store-changelog/log/${siteId}`, { params });
      const data = res.data;

      setLog(data.log || []);
      setUsers(data.users || {});
      setActions(data.actions || {});
      setIsBigadmin(data.bigadmin === 'y');
      setLogDifference(data.log_difference || 'n');

      if (data.search) {
        setFilterUser(data.search.user || '');
        setFilterAction(data.search.log_action || '');
        setFilterLast(data.search.last || '30');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load changelog');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChangelog(filterUser, filterAction, filterLast);
  };

  const togglePopover = (idx: number) => {
    setActivePopover(activePopover === idx ? null : idx);
  };

  if (loading && log.length === 0) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sql-popover {
          position: relative;
          display: inline-block;
        }
        .sql-popover-content {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          max-width: 400px;
          max-height: 300px;
          overflow: auto;
          word-wrap: break-word;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,.2);
          font-size: 12px;
          font-family: monospace;
        }
        .sql-popover-content h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: bold;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
      `}</style>

      <div className="row">
        <div className="col-lg-12">
          <h1>Store Change Log</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Filter Form — matches old platform store_changelog.tpl exactly */}
      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-lg-12">
            <div className="table-responsive">
              <table className="table cv3-data-table">
                <tbody>
                  <tr>
                    <td>
                      <select
                        name="user"
                        className="form-control form-control-inline"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                      >
                        <option value="">--Choose User--</option>
                        {Object.entries(users).map(([uid, username]) => (
                          <option key={uid} value={uid}>
                            {username}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        name="log_action"
                        className="form-control form-control-inline"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                      >
                        <option value="">--Choose Action--</option>
                        {Object.entries(actions).map(([action, label]) => (
                          <option key={action} value={action}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      Show last{' '}
                      <input
                        type="text"
                        className="form-control form-control-inline"
                        name="last"
                        size={3}
                        value={filterLast}
                        onChange={(e) => setFilterLast(e.target.value)}
                        style={{ width: '60px', display: 'inline-block' }}
                      />{' '}
                      records
                    </td>
                    <td>
                      <button type="submit" className="btn btn-primary">
                        Modify Report
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>

      {/* Changelog Table — matches old platform exactly */}
      <div className="row">
        <div className="col-lg-12">
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Extra</th>
                    <th>Difference</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {log.length > 0 ? (
                    log.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{users[entry.user_id] || entry.user_id}</td>
                        <td>{entry.action}</td>
                        <td>{entry.specific_information}</td>
                        <td>
                          {isBigadmin && logDifference === 'y' && entry.difference && (
                            <span className="sql-popover">
                              [
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  togglePopover(idx);
                                }}
                              >
                                View SQL
                              </a>
                              ]
                              {activePopover === idx && (
                                <div className="sql-popover-content">
                                  <h4>SQL</h4>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: entry.difference
                                        .replace(/"/g, '&#34;')
                                        .replace(/,/g, '<br/>'),
                                    }}
                                  />
                                </div>
                              )}
                            </span>
                          )}
                        </td>
                        <td>{entry.ndate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center' }}>
                        No changelog entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
