'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Blast {
  blast_id: number;
  store: string;
  estimated_size: number | null;
  estimated_total: number;
  estimated_sent: number;
  estimated_start: string;
  last_modified: string;
  send_server: string;
  from_account: string;
}

export default function BlastQueuePage() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/blastqueue');
      setBlasts(res.data.blasts || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load blast queue');
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
          <h1>Blast Queue</h1>
          <p>
            <i className="fa fa-info-circle"></i> Now you can see for your very own selves what is going on in the queue, when things will be sending and what is being sent now.
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

      <div className="row">
        <div className="col-lg-12">
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th>Store (blast_id)</th>
                    <th>Email Size</th>
                    <th>Num to Send</th>
                    <th>Num Sent</th>
                    <th>Percent Complete</th>
                    <th>Start Time</th>
                    <th>Last Modified</th>
                    <th>Send Server</th>
                    <th>Send Type</th>
                  </tr>
                </thead>
                <tbody>
                  {blasts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center">No blasts in queue</td>
                    </tr>
                  ) : (
                    blasts.map((blast) => {
                      const sizeKb = blast.estimated_size
                        ? (blast.estimated_size / 1024).toFixed(2) + 'kb'
                        : 'N/A';
                      const percent = blast.estimated_total > 0
                        ? Math.round((blast.estimated_sent / blast.estimated_total) * 100)
                        : 0;
                      const server = blast.send_server
                        ? blast.send_server.replace(/\..*$/, '')
                        : '';
                      const sendType = blast.from_account ? 'netcore' : 'lettercast';

                      return (
                        <tr key={blast.blast_id}>
                          <td>{blast.store} ({blast.blast_id})</td>
                          <td>{sizeKb}</td>
                          <td>{blast.estimated_total}</td>
                          <td>{blast.estimated_sent}</td>
                          <td>{percent}%</td>
                          <td>{blast.estimated_start}</td>
                          <td>{blast.last_modified}</td>
                          <td>{server}</td>
                          <td>{sendType}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
