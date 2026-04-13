'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  position: number;
}

export default function ProductCustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/custom-fields');
      setFields(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch custom fields:', err);
      setError('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this custom field?')) {
      return;
    }

    try {
      await api.delete(`/products/custom-fields/${fieldId}`);
      setFields(fields.filter(f => f.id !== fieldId));
    } catch (err) {
      console.error('Failed to delete field:', err);
      setError('Failed to delete custom field');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Custom Fields</h1>
          <p>
            <i className="fa fa-file"></i> Manage custom fields for products.
          </p>
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
          <Link href="/products/custom-fields/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Custom Field
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading custom fields...</p>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Custom Fields</h3>
              </div>
              <div className="panel-body">
                {fields.length === 0 ? (
                  <p className="text-muted">No custom fields defined.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map(field => (
                        <tr key={field.id}>
                          <td>{field.name}</td>
                          <td>{field.type}</td>
                          <td>
                            {field.required ? (
                              <span className="badge badge-success">Yes</span>
                            ) : (
                              <span className="badge">No</span>
                            )}
                          </td>
                          <td>{field.position}</td>
                          <td>
                            <Link
                              href={`/products/custom-fields/edit/${field.id}`}
                              className="btn btn-sm btn-default"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(field.id)}
                              className="btn btn-sm btn-danger"
                            >
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
