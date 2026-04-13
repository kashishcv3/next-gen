'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Reminder {
  id: string;
  name: string;
  message: string;
  trigger_type: string;
  trigger_value: string;
  status: string;
  created_date: string;
}

export default function RemindersListPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders');
      setReminders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      setError('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Auto Reminders</h1>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/reminders/list" className="btn btn-success">
          <i className="fa fa-plus"></i> Create Reminder
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading reminders...</div>}

      {!loading && reminders.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Reminders ({reminders.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Trigger</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder) => (
                  <tr key={reminder.id}>
                    <td>{reminder.name}</td>
                    <td>{reminder.trigger_type} ({reminder.trigger_value})</td>
                    <td>{reminder.message.substring(0, 50)}...</td>
                    <td>
                      <span className={`label label-${reminder.status === 'active' ? 'success' : 'default'}`}>
                        {reminder.status}
                      </span>
                    </td>
                    <td>{formatDate(reminder.created_date)}</td>
                    <td>
                      <Link href={`/reminders/edit/${reminder.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && reminders.length === 0 && !error && (
        <div className="alert alert-info">No reminders found.</div>
      )}
    </div>
  );
}
