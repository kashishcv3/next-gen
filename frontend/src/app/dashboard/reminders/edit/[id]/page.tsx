'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface Reminder {
  id: string;
  name: string;
  message: string;
  trigger_type: string;
  trigger_value: string;
  status: string;
}

export default function EditReminderPage() {
  const router = useRouter();
  const params = useParams();
  const reminderId = params.id as string;

  const [formData, setFormData] = useState<Reminder>({
    id: '',
    name: '',
    message: '',
    trigger_type: 'days',
    trigger_value: '1',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReminder();
  }, [reminderId]);

  const fetchReminder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reminders/${reminderId}`);
      setFormData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reminder:', err);
      setError('Failed to load reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/reminders/${reminderId}`, formData);
      router.push('/reminders/list');
    } catch (err) {
      console.error('Failed to save reminder:', err);
      setError('Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading reminder...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Reminder</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Reminder Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Reminder Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="trigger_type">Trigger Type</label>
                    <select
                      className="form-control"
                      id="trigger_type"
                      name="trigger_type"
                      value={formData.trigger_type}
                      onChange={handleChange}
                      disabled={saving}
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="trigger_value">Value</label>
                    <input
                      type="number"
                      className="form-control"
                      id="trigger_value"
                      name="trigger_value"
                      value={formData.trigger_value}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                  <i className="fa fa-save"></i> Save Changes
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={saving}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
