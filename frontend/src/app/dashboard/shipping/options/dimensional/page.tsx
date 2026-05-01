'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface DimBox {
  id: number;
  length: string;
  width: string;
  height: string;
  volume: string;
}

export default function DimensionalShippingPage() {
  const [boxes, setBoxes] = useState<DimBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editBox, setEditBox] = useState<DimBox | null>(null);
  const [form, setForm] = useState({ length: '', width: '', height: '' });

  useEffect(() => { fetchBoxes(); }, []);

  const fetchBoxes = async () => {
    try {
      const res = await api.get('/shipping/options/dimensional');
      setBoxes(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dimensional shipping boxes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditBox(null);
    setForm({ length: '', width: '', height: '' });
    setShowForm(true);
  };

  const handleEdit = (b: DimBox) => {
    setEditBox(b);
    setForm({ length: b.length, width: b.width, height: b.height });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null);
    try {
      const payload: any = { ...form };
      if (editBox) payload.id = editBox.id;
      await api.post('/shipping/options/dimensional', payload);
      setSuccess(editBox ? 'Box dimensions updated successfully' : 'Box added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowForm(false);
      fetchBoxes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this box?')) return;
    try {
      await api.delete(`/shipping/options/dimensional/${id}`);
      setSuccess('Box deleted');
      setTimeout(() => setSuccess(null), 3000);
      fetchBoxes();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete');
    }
  };

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading dimensional shipping data...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-cube" style={{ color: '#337ab7' }}></i> Dimensional Shipping</h1>
          <p className="text-muted">Configure box dimensions for dimensional weight shipping calculations. Carriers use dimensional weight to determine shipping costs based on package size.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className="fa fa-plus"></i> Add Box
          </button>
        </div>
      </div>

      {showForm && (
        <div className="row"><div className="col-lg-8">
          <div className="panel panel-primary" style={{ marginBottom: '20px' }}>
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className={`fa fa-${editBox ? 'edit' : 'plus-circle'}`}></i> {editBox ? 'Edit' : 'Add'} Box Dimensions
              </h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                <p className="text-muted" style={{ marginBottom: '15px' }}>Enter dimensions in inches. Volume will be calculated automatically.</p>
                <div className="row">
                  <div className="col-sm-4">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>
                        <i className="fa fa-arrows-h" style={{ color: '#337ab7', marginRight: '4px' }}></i> Length
                      </label>
                      <div className="input-group" style={{ maxWidth: '200px' }}>
                        <input type="number" step="0.01" min="0" className="form-control" value={form.length}
                          onChange={e => setForm({...form, length: e.target.value})} required
                          placeholder="0.00" />
                        <span className="input-group-addon">in</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>
                        <i className="fa fa-arrows-h" style={{ color: '#337ab7', marginRight: '4px' }}></i> Width
                      </label>
                      <div className="input-group" style={{ maxWidth: '200px' }}>
                        <input type="number" step="0.01" min="0" className="form-control" value={form.width}
                          onChange={e => setForm({...form, width: e.target.value})} required
                          placeholder="0.00" />
                        <span className="input-group-addon">in</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ fontWeight: 600 }}>
                        <i className="fa fa-arrows-v" style={{ color: '#337ab7', marginRight: '4px' }}></i> Height
                      </label>
                      <div className="input-group" style={{ maxWidth: '200px' }}>
                        <input type="number" step="0.01" min="0" className="form-control" value={form.height}
                          onChange={e => setForm({...form, height: e.target.value})} required
                          placeholder="0.00" />
                        <span className="input-group-addon">in</span>
                      </div>
                    </div>
                  </div>
                </div>
                {form.length && form.width && form.height && (
                  <div className="alert alert-info" style={{ marginBottom: '15px' }}>
                    <i className="fa fa-calculator"></i> Calculated Volume: <strong>{(parseFloat(form.length || '0') * parseFloat(form.width || '0') * parseFloat(form.height || '0')).toFixed(2)} in&sup3;</strong>
                  </div>
                )}
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

      <div className="row"><div className="col-lg-10">
        <div className="panel panel-default">
          <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
            <h3 className="panel-title">
              <i className="fa fa-cubes" style={{ color: '#337ab7', marginRight: '8px' }}></i>
              Box Dimensions
              {boxes.length > 0 && <span className="badge" style={{ marginLeft: '8px', background: '#337ab7' }}>{boxes.length}</span>}
            </h3>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th className="text-center">Length (in)</th>
                  <th className="text-center">Width (in)</th>
                  <th className="text-center">Height (in)</th>
                  <th className="text-center">Volume (in&sup3;)</th>
                  <th className="text-right" style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boxes.length > 0 ? boxes.map(b => (
                  <tr key={b.id}>
                    <td><span className="label label-default">{b.id}</span></td>
                    <td className="text-center">{b.length}</td>
                    <td className="text-center">{b.width}</td>
                    <td className="text-center">{b.height}</td>
                    <td className="text-center">
                      <strong>{b.volume}</strong>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-xs btn-info" onClick={() => handleEdit(b)} title="Edit">
                        <i className="fa fa-edit"></i>
                      </button>
                      {' '}
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(b.id)} title="Delete">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ padding: '30px' }}>
                      <i className="fa fa-cube" style={{ fontSize: '24px', color: '#ccc', display: 'block', marginBottom: '10px' }}></i>
                      <span className="text-muted">No dimensional shipping boxes configured.</span>
                      <br />
                      <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ marginTop: '10px' }}>
                        <i className="fa fa-plus"></i> Add Your First Box
                      </button>
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
