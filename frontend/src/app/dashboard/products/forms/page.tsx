'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Form {
  id: string;
  name: string;
  fields_count: number;
}

export default function ProductFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/forms');
      setForms(response.data.data || []);
    } catch (err) {
      setError('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!window.confirm('Delete this form?')) return;
    try {
      await api.delete(`/products/forms/${formId}`);
      setForms(forms.filter(f => f.id !== formId));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Forms</h1>
          <p><i className="fa fa-wpforms"></i> Manage product custom forms.</p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <Link href="/products/forms/new" className="btn btn-primary">
            <i className="fa fa-plus"></i> New Form
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Forms ({forms.length})</h3>
              </div>
              <div className="panel-body">
                {forms.length === 0 ? (
                  <p className="text-muted">No forms found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Fields</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map(form => (
                        <tr key={form.id}>
                          <td>{form.name}</td>
                          <td><span className="badge">{form.fields_count}</span></td>
                          <td>
                            <Link href={`/products/forms/edit/${form.id}`} className="btn btn-sm btn-default">
                              Edit
                            </Link>
                            <button onClick={() => handleDelete(form.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
