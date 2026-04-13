'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function TemplateListPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/templates?${params.toString()}`);
      setTemplates(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTemplates(search);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Templates</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="col-md-6">
              <button className="btn btn-primary" onClick={handleSearch}>
                <i className="fa fa-search"></i> Search
              </button>
              <Link href="/templates/add" className="btn btn-success" style={{ marginLeft: '5px' }}>
                <i className="fa fa-plus"></i> Add Template
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Templates ({templates.length})</h3>
        </div>
        {templates.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>
                      <span className={`label label-${template.status === 'published' ? 'success' : 'warning'}`}>
                        {template.status}
                      </span>
                    </td>
                    <td>{formatDate(template.created_at)}</td>
                    <td>{formatDate(template.updated_at)}</td>
                    <td>
                      <Link href={`/templates/edit/${template.id}`} className="btn btn-xs btn-warning">
                        Edit
                      </Link>
                      <Link href={`/templates/delete/${template.id}`} className="btn btn-xs btn-danger" style={{ marginLeft: '3px' }}>
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel-body">
            <p>No templates found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
