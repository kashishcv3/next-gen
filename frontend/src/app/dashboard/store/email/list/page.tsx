'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

export default function EmailListPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/store/email/templates');
      setTemplates(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Delete this email template?')) return;

    try {
      await api.delete(`/store/email/templates/${templateId}`);
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Email Templates</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage email templates for your store.
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
          <Link href="/store/email/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add New Template
          </Link>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-envelope"></i> Email Templates
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.length > 0 ? (
                      templates.map(template => (
                        <tr key={template.id}>
                          <td>{template.name}</td>
                          <td><span className="label label-info">{template.type}</span></td>
                          <td>{template.subject}</td>
                          <td>{new Date(template.updated_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/store/email/edit/${template.id}`} className="btn btn-xs btn-primary">
                              <i className="fa fa-edit"></i> Edit
                            </Link>
                            {' '}
                            <button
                              className="btn btn-xs btn-danger"
                              onClick={() => handleDelete(template.id)}
                            >
                              <i className="fa fa-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">No email templates found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
