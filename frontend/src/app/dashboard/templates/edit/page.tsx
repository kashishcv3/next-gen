'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Alert, Spinner, Card, Form } from '@/lib/react-bootstrap';

interface TemplateDetail {
  id: number;
  name: string;
  template_type: string;
  content: string;
  created_date: string | null;
  last_modified: string | null;
}

export default function DashboardTemplateEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    template_type: '',
    content: '',
    created_date: '',
    last_modified: '',
  });

  useEffect(() => {
    if (templateId) fetchTemplate();
    else setLoading(false);
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<TemplateDetail>(`/templates/${templateId}`);
      setFormData({
        id: response.data.id,
        name: response.data.name,
        template_type: response.data.template_type || '',
        content: response.data.content || '',
        created_date: response.data.created_date || '',
        last_modified: response.data.last_modified || '',
      });
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

      await api.put(`/templates/${formData.id}`, {
        name: formData.name,
        template_type: formData.template_type,
        content: formData.content,
      });

      setSuccess('Template saved successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      await api.post(`/templates/${encodeURIComponent(formData.name)}/publish`);
      setSuccess('Template published successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish');
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    try {
      setSaving(true);
      await api.post(`/templates/lock/${encodeURIComponent(formData.name)}`);
      setSuccess('Template locked');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to lock');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/templates/list');
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

  if (!templateId) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger">No template ID provided.</Alert>
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
            Edit Dashboard Template: <code>{formData.name}</code>
          </h1>
          <p className="text-muted">
            Type: {formData.template_type} | Created: {formData.created_date || 'N/A'} | Last Modified: {formData.last_modified || 'N/A'}
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>
          </Col>
        </Row>
      )}

      <form onSubmit={handleSave}>
        {/* Basic Info */}
        <Row className="mb-3">
          <Col lg={6}>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
          <Col lg={6}>
            <Form.Group className="mb-3">
              <Form.Label>Template Type</Form.Label>
              <select
                className="form-control"
                name="template_type"
                value={formData.template_type}
                onChange={handleInputChange}
              >
                <option value="">Select type</option>
                <option value="Site Design">Site Design</option>
                <option value="User Defined">User Defined</option>
                <option value="Catalog Display">Catalog Display</option>
                <option value="Contact Form">Contact Form</option>
                <option value="Member">Member</option>
                <option value="Checkout">Checkout</option>
                <option value="Email Confirmation">Email Confirmation</option>
                <option value="Miscellaneous">Miscellaneous</option>
                <option value="CSS Stylesheets">CSS Stylesheets</option>
                <option value="JavaScript Files">JavaScript Files</option>
                <option value="Other Files">Other Files</option>
              </select>
            </Form.Group>
          </Col>
        </Row>

        {/* Content */}
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

        {/* Actions */}
        <Row className="mb-3">
          <Col lg={12}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Button variant="primary" type="submit" disabled={saving}>
                <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="success" type="button" onClick={handlePublish} disabled={saving}>
                <i className="fa fa-upload"></i> Publish
              </Button>
              <Button variant="default" type="button" onClick={handleCancel} disabled={saving}>
                <i className="fa fa-times"></i> Cancel
              </Button>
              <Button
                variant="warning"
                type="button"
                onClick={handleLock}
                disabled={saving}
                style={{ marginLeft: 'auto' }}
              >
                <i className="fa fa-lock"></i> Lock
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </Container>
  );
}
