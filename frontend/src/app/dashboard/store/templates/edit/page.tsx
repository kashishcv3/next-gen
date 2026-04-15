'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Alert, Spinner, Card, Form } from '@/lib/react-bootstrap';

interface TemplateContent {
  filename: string;
  type: string;
  content: string;
  common_name: string;
  category: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  locked: boolean;
  locked_by: number | null;
}

export default function StoreTemplateEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filename = searchParams.get('filename');
  const type = searchParams.get('type') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateContent>({
    filename: filename || '',
    type: type,
    content: '',
    common_name: '',
    category: '',
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    locked: false,
    locked_by: null,
  });

  useEffect(() => {
    if (filename) fetchTemplate();
    else setLoading(false);
  }, [filename, type]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/store-templates/content', {
        params: { filename, type },
      });
      setFormData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError('Template content cannot be empty');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.put('/store-templates/content', {
        filename: formData.filename,
        type: formData.type,
        content: formData.content,
        common_name: formData.common_name,
        category: formData.category,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
      });

      setSuccess('Template saved successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      setSaving(true);
      const userStr = localStorage.getItem('auth_user');
      let userId = 0;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id || 0;
        } catch {}
      }

      await api.post('/store-templates/lock', {
        filename: formData.filename,
        lock: !formData.locked,
        user_id: userId,
      });

      setSuccess(`Template ${formData.locked ? 'unlocked' : 'locked'} successfully`);
      fetchTemplate();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update lock');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/store/templates/list?type=${type}`);
  };

  const typeDisplay: Record<string, string> = {
    tpl: 'Template',
    css: 'CSS Stylesheet',
    js: 'JavaScript File',
    other: 'Other File',
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col lg={12}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p style={{ marginTop: '15px' }}>Loading template...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!filename) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger">No template filename provided.</Alert>
        <Button variant="default" onClick={handleCancel}>
          <i className="fa fa-arrow-left"></i> Back to Templates
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col lg={12}>
          <h1>
            Edit {typeDisplay[type] || 'File'}: <code>{formData.filename}</code>
          </h1>
          {formData.locked && (
            <p style={{ color: '#d9534f' }}>
              <i className="fa fa-lock"></i> This template is locked
            </p>
          )}
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <form onSubmit={handleSave}>
        {/* Template Content */}
        <Row className="mb-3">
          <Col lg={12}>
            <Card>
              <Card.Header>
                <strong>Template Content</strong>
              </Card.Header>
              <Card.Body className="p-3">
                <textarea
                  className="form-control"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '13px',
                    lineHeight: '1.5',
                    minHeight: '500px',
                    whiteSpace: 'pre',
                    tabSize: 4,
                  }}
                  required
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Row className="mb-3">
          <Col lg={6}>
            <Card>
              <Card.Header>
                <strong>Basic Information</strong>
              </Card.Header>
              <Card.Body className="p-3">
                <Form.Group className="mb-3">
                  <Form.Label>Common Name</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="common_name"
                    value={formData.common_name || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Header Template"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    <option value="Site Design">Site Design</option>
                    <option value="User Defined">User Defined</option>
                    <option value="Catalog Display">Catalog Display</option>
                    <option value="Contact Form">Contact Form</option>
                    <option value="Member">Member</option>
                    <option value="Checkout">Checkout</option>
                    <option value="Recipe">Recipe</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Custom Product Form">Custom Product Form</option>
                    <option value="Generic Form">Generic Form</option>
                    <option value="Email Confirmation">Email Confirmation</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Meta Information */}
          <Col lg={6}>
            <Card>
              <Card.Header>
                <strong>Meta Information</strong>
              </Card.Header>
              <Card.Body className="p-3">
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="meta_title"
                    value={formData.meta_title || ''}
                    onChange={handleInputChange}
                    placeholder="Page title for SEO"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <textarea
                    className="form-control"
                    name="meta_description"
                    value={formData.meta_description || ''}
                    onChange={handleInputChange}
                    placeholder="Description for search engines"
                    rows={2}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Meta Keywords</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="meta_keywords"
                    value={formData.meta_keywords || ''}
                    onChange={handleInputChange}
                    placeholder="Comma-separated keywords"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <Row className="mb-3">
          <Col lg={12}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button variant="primary" type="submit" disabled={saving}>
                <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save Template'}
              </Button>
              <Button variant="default" type="button" onClick={handleCancel} disabled={saving}>
                <i className="fa fa-times"></i> Cancel
              </Button>
              <Button
                variant={formData.locked ? 'success' : 'warning'}
                type="button"
                onClick={handleToggleLock}
                disabled={saving}
                style={{ marginLeft: 'auto' }}
              >
                <i className={`fa fa-${formData.locked ? 'unlock-alt' : 'lock'}`}></i>{' '}
                {formData.locked ? 'Unlock' : 'Lock'}
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </Container>
  );
}
