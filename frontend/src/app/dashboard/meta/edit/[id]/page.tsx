'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface FormData {
  name: string;
  title: string;
  keywords: string;
  description: string;
  classification: string;
  pre_comment: string;
  pre_body: string;
  post_comment: string;
  post_body: string;
  alt_tag1: string;
  alt_tag2: string;
  alt_tag3: string;
}

export default function MetaTagEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    title: '',
    keywords: '',
    description: '',
    classification: '',
    pre_comment: '',
    pre_body: '',
    post_comment: '',
    post_body: '',
    alt_tag1: '',
    alt_tag2: '',
    alt_tag3: '',
  });

  useEffect(() => {
    fetchMetaTag();
  }, [id]);

  const fetchMetaTag = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/marketing/meta-tags/${id}`);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meta tag:', err);
      setError('Failed to load meta tag');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.put(`/marketing/meta-tags/${id}`, formData);
      router.push('/dashboard/meta/list');
    } catch (err) {
      console.error('Failed to update meta tag:', err);
      setError('Failed to update meta tag');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Meta Tag Set</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="name">Set Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title Tag</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="keywords">Keywords</label>
              <input
                type="text"
                className="form-control"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="classification">Classification</label>
              <input
                type="text"
                className="form-control"
                id="classification"
                name="classification"
                value={formData.classification}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pre_comment">Top of Page Comment</label>
              <input
                type="text"
                className="form-control"
                id="pre_comment"
                name="pre_comment"
                value={formData.pre_comment}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pre_body">Top of Page Text</label>
              <textarea
                className="form-control"
                id="pre_body"
                name="pre_body"
                value={formData.pre_body}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="post_comment">Bottom of Page Comment</label>
              <input
                type="text"
                className="form-control"
                id="post_comment"
                name="post_comment"
                value={formData.post_comment}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="post_body">Bottom of Page Text</label>
              <textarea
                className="form-control"
                id="post_body"
                name="post_body"
                value={formData.post_body}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="alt_tag1">Alt Image Text 1</label>
              <input
                type="text"
                className="form-control"
                id="alt_tag1"
                name="alt_tag1"
                value={formData.alt_tag1}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="alt_tag2">Alt Image Text 2</label>
              <input
                type="text"
                className="form-control"
                id="alt_tag2"
                name="alt_tag2"
                value={formData.alt_tag2}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="alt_tag3">Alt Image Text 3</label>
              <input
                type="text"
                className="form-control"
                id="alt_tag3"
                name="alt_tag3"
                value={formData.alt_tag3}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <i className="fa fa-save"></i> Save Changes
              </button>
              <a href="/dashboard/meta/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                Cancel
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
