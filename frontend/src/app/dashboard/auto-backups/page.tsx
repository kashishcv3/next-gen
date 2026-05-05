'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BackupFile {
  date: string;
  file: string;
}

export default function AutoBackupsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/store/auto-backups');
      setBackups(response.data.backups || []);
      setIsLive(response.data.is_live !== false);
      setHasAccess(response.data.has_access !== false);
    } catch (err: any) {
      // If API doesn't exist yet, show empty state
      setBackups([]);
      setIsLive(true);
      setHasAccess(true);
    } finally {
      setLoading(false);
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
          <h1>Automatic Backups</h1>
          <p>
            Automatically backup your design files (templates, JS, CSS, etc.). You will have access to nightly backups for one week and weekly backups for at least two weeks.
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

      {!isLive ? (
        <>
          <br />
          <div className="row">
            <div className="col-lg-12">
              <span className="label label-warning">Note</span> This feature is only available for live stores.
            </div>
          </div>
        </>
      ) : !hasAccess ? (
        <>
          <br />
          <div className="row">
            <div className="col-lg-12">
              <span className="label label-warning">Note</span> You do not have access to automatic backups at this time.
            </div>
          </div>
        </>
      ) : (
        <>
          <p>
            <span className="label label-warning">Note</span> IE users may need to right click and &quot;Save Target As&quot; to download the file.
          </p>
          <br />

          <div className="row">
            <div className="col-lg-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title"><i className="fa fa-database"></i> Available Backups</h3>
                </div>
                <div className="panel-body">
                  {backups.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="fa fa-info-circle"></i> No backup files available at this time.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-striped">
                        <thead>
                          <tr>
                            <th>Available Backups</th>
                            <th style={{ width: '80px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {backups.map((backup, index) => (
                            <tr key={index}>
                              <td>{backup.date}</td>
                              <td>
                                <a
                                  href="#"
                                  title="Download Backup"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    alert('Backup download functionality requires server-side file access.');
                                  }}
                                >
                                  <i className="fa fa-download"></i>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
