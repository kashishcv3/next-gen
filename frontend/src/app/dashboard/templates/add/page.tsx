'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Alert, Card, Form } from '@/lib/react-bootstrap';

export default function DashboardTemplateAddPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: '',
    content: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Template name is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/templates/', {
        name: formData.name,
        template_type: formData.template_type || 'Miscellaneous',
        content: formData.content,
      });

      router.push('/dashboard/templates/list');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/templates/list');
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col lg={12}>
          <h1>Create Dashboard Template</h1>
          <p>
            <i className="fa fa-info-circle"></i> Create a new dashboard-level template.
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

      <form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col lg={8}>
            <Card>
              <Card.Header>
                <strong>Template Information</strong>
              </Card.Header>
              <Card.Body className="p-3">
                <Form.Group className="mb-3">
                  <Form.Label>Template Name *</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., header.tpl, custom-page.tpl"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Template Type *</Form.Label>
                  <select
                    className="form-control"
                    name="template_type"
                    value={formData.template_type}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">-- Select type --</option>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={12}>
            <Card>
              <Card.Header>
                <strong>Content *</strong>
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
                    minHeight: '400px',
                    whiteSpace: 'pre',
                    tabSize: 4,
                  }}
                  placeholder="Enter template content..."
                  required
                  disabled={loading}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={12}>
            <Button variant="primary" type="submit" disabled={loading} style={{ marginRight: '10px' }}>
              <i className="fa fa-save"></i> {loading ? 'Creating...' : 'Create Template'}
            </Button>
            <Button variant="default" type="button" onClick={handleCancel} disabled={loading}>
              <i className="fa fa-times"></i> Cancel
            </Button>
          </Col>
        </Row>
      </form>
    </Container>
  );
}
