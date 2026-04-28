'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Blast {
  id: number;
  site_id: number;
  store_name: string;
  email_size: number;
  emails_to_send: number;
  sent: number;
  percent_complete: number;
  start_time: string | null;
  send_server: string;
}

export default function StoreBlastqueuePage() {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stores/blastqueue');
        setBlasts(response.data.blasts);
      } catch (err) {
        setError('Failed to load blast queue data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Email Blast Queue</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Blast ID</th>
              <th>Email Size</th>
              <th>Emails to Send</th>
              <th>Sent</th>
              <th>% Complete</th>
              <th>Start Time</th>
              <th>Send Server</th>
            </tr>
          </thead>
          <tbody>
            {blasts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No blast queue entries found
                </td>
              </tr>
            ) : (
              blasts.map((blast) => (
                <tr key={blast.id}>
                  <td>{blast.store_name}</td>
                  <td>{blast.id}</td>
                  <td>{blast.email_size}</td>
                  <td>{blast.emails_to_send}</td>
                  <td>{blast.sent}</td>
                  <td>{blast.percent_complete}%</td>
                  <td>{formatDate(blast.start_time)}</td>
                  <td>{blast.send_server}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
