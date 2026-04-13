'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  type: string;
  subject: string;
  body: string;
  html_body: string;
}

export default function EmailAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'transactional',
    subject: '',
    body: '',
    html_body: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/store/email/templates', formData);
      router.push('/store/email/list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create email template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Email Template</h1>
          <p>
            <i className="fa fa-info-circle"></i> Create a new email template.
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

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-envelope"></i> Email Template Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Template Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Template Type *</label>
                  <select
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="help-block">Available variables: {'{'}first_name{'}'}, {'{'}last_name{'}'}, {'{'}order_id{'}'}</p>
                </div>

                <div className="form-group">
                  <label>Plain Text Body *</label>
                  <textarea
                    className="form-control"
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    rows={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>HTML Body</label>
                  <textarea
                    className="form-control"
                    name="html_body"
                    value={formData.html_body}
                    onChange={handleInputChange}
                    rows={8}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </button>
            <a href="/store/email/list" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
