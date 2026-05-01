'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ShipDate {
  id: number;
  description: string;
  month: string;
  day: string;
  display_order: number;
  start_date: string;
  stop_date: string;
}

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

export default function PresetShipDatesPage() {
  const [dates, setDates] = useState<ShipDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editDate, setEditDate] = useState<ShipDate | null>(null);
  const [form, setForm] = useState({ description: '', month: '', day: '', start_date: '', stop_date: '' });

  useEffect(() => { fetchDates(); }, []);

  const fetchDates = async () => {
    try {
      const res = await api.get('/shipping/options/preset-dates');
      setDates(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load preset ship dates');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditDate(null);
    setForm({ description: '', month: '', day: '', start_date: '', stop_date: '' });
    setShowForm(true);
  };

  const handleEdit = (d: ShipDate) => {
    setEditDate(d);
    setForm({ description: d.description, month: d.month, day: d.day, start_date: d.start_date, stop_date: d.stop_date });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null);
    try {
      const payload: any = { ...form };
      if (editDate) payload.id = editDate.id;
      await api.post('/shipping/options/preset-dates', payload);
      setSuccess(editDate ? 'Preset ship date updated successfully' : 'Preset ship date added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowForm(false);
      fetchDates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this preset ship date?')) return;
    try {
      await api.delete(`/shipping/options/preset-dates/${id}`);
      setSuccess('Preset ship date deleted');
      setTimeout(() => setSuccess(null), 3000);
      fetchDates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const getMonthName = (m: string) => MONTHS.find(mo => mo.value === m)?.label || m;

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading preset ship dates...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-calendar-check-o" style={{ color: '#337ab7' }}></i> Preset Ship Dates</h1>
          <p className="text-muted">Configure preset shipping dates for orders. These dates define specific ship-by dates that can be assigned to orders.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className="fa fa-plus"></i> Add Preset Date
          </button>
        </div>
      </div>

      {showForm && (
        <div className="row"><div className="col-lg-8">
          <div className="panel panel-primary" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className={`fa fa-${editDate ? 'edit' : 'plus-circle'}`}></i> {editDate ? 'Edit' : 'Add'} Preset Ship Date
              </h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 600 }}>Description</label>
                  <div><small className="text-muted">A descriptive name for this ship date (e.g. "Christmas Delivery")</small></div>
                  <input type="text" className="form-control" value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Enter description" required
                    style={{ maxWidth: '400px', marginTop: '4px' }} />
                </div>
                <div className="row">
                  <div className="col-sm-4">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>Month</label>
                      <select className="form-control" value={form.month}
                        onChange={e => setForm({...form, month: e.target.value})}>
                        <option value="">-- Select Month --</option>
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>Day</label>
                      <select className="form-control" value={form.day}
                        onChange={e => setForm({...form, day: e.target.value})}>
                        <option value="">-- Select Day --</option>
                        {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>Start Date</label>
                      <div><small className="text-muted">When this preset becomes active</small></div>
                      <input type="datetime-local" className="form-control" value={form.start_date ? form.start_date.replace(' ', 'T').slice(0, 16) : ''}
                        onChange={e => setForm({...form, start_date: e.target.value ? e.target.value.replace('T', ' ') + ':00' : ''})}
                        style={{ maxWidth: '280px', marginTop: '4px' }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>Stop Date</label>
                      <div><small className="text-muted">When this preset expires</small></div>
                      <input type="datetime-local" className="form-control" value={form.stop_date ? form.stop_date.replace(' ', 'T').slice(0, 16) : ''}
                        onChange={e => setForm({...form, stop_date: e.target.value ? e.target.value.replace('T', ' ') + ':00' : ''})}
                        style={{ maxWidth: '280px', marginTop: '4px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '5px' }}>
                  <button type="submit" className="btn btn-primary"><i className="fa fa-save"></i> Save</button>
                  {' '}
                  <button type="button" className="btn btn-default" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div></div>
      )}

      <div className="row"><div className="col-lg-12">
        <div className="panel panel-default">
          <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
            <h3 className="panel-title">
              <i className="fa fa-calendar" style={{ color: '#337ab7', marginRight: '8px' }}></i>
              Preset Ship Dates
              {dates.length > 0 && <span className="badge" style={{ marginLeft: '8px', background: '#337ab7' }}>{dates.length}</span>}
            </h3>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Order</th>
                  <th>Description</th>
                  <th>Ship Date</th>
                  <th>Active Period</th>
                  <th className="text-right" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dates.length > 0 ? dates.map(d => (
                  <tr key={d.id}>
                    <td><span className="label label-default">{d.display_order}</span></td>
                    <td style={{ fontWeight: 600 }}>{d.description}</td>
                    <td>
                      <i className="fa fa-calendar-o" style={{ color: '#337ab7', marginRight: '4px' }}></i>
                      {getMonthName(d.month)} {d.day}
                    </td>
                    <td>
                      <small className="text-muted">
                        {d.start_date || '—'} <i className="fa fa-arrow-right" style={{ margin: '0 4px', fontSize: '10px' }}></i> {d.stop_date || '—'}
                      </small>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-xs btn-info" onClick={() => handleEdit(d)} title="Edit">
                        <i className="fa fa-edit"></i>
                      </button>
                      {' '}
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(d.id)} title="Delete">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ padding: '30px' }}>
                      <i className="fa fa-calendar-o" style={{ fontSize: '24px', color: '#ccc', display: 'block', marginBottom: '10px' }}></i>
                      <span className="text-muted">No preset ship dates configured.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div></div>
    </div>
  );
}
