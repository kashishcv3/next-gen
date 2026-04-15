'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Alert, Card, Form } from '@/lib/react-bootstrap';

export default function StoreTemplateAddPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    filename: '',
    type: 'tpl',
    content: '',
    common_name: '',
    category: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.filename.trim()) {
      setError('Filename is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    const validPattern = /^[a-zA-Z0-9_\-\.]+$/;
    if (!validPattern.test(formData.filename)) {
      setError('Filename can only contain letters, numbers, underscores, hyphens, and dots');
      return;
    }

    // Add extension if missing
    let filename = formData.filename;
    const extMap: Record<string, string> = { tpl: '.tpl', css: '.css', js: '.js' };
    const ext = extMap[formData.type];
    if (ext && !filename.endsWith(ext)) {
      filename += ext;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/store-templates/create', {
        filename,
        type: formData.type,
        content: formData.content,
        common_name: formData.common_name || filename,
        category: formData.category || 'Miscellaneous',
      });

      router.push('/dashboard/store/templates/list');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/store/templates/list');
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col lg={12}>
          <h1>Create New Store Template</h1>
          <p>
            <i className="fa fa-info-circle"></i> Create a new template file for your store.
          </p>
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

      <form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col lg={8}>
            <Card>
              <Card.Header>
                <strong>File Information</strong>
              </Card.Header>
              <Card.Body className="p-3">
                <Form.Group className="mb-3">
                  <Form.Label>Filename *</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="filename"
                    value={formData.filename}
                    onChange={handleInputChange}
                    placeholder="e.g., header, product-list, custom-styles"
                    required
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Extension will be added automatically based on type.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>File Type *</Form.Label>
                  <select
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="tpl">Template (.tpl)</option>
                    <option value="css">CSS Stylesheet (.css)</option>
                    <option value="js">JavaScript File (.js)</option>
                    <option value="other">Other File</option>
                  </select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Common Name</Form.Label>
                  <input
                    type="text"
                    className="form-control"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Site Header"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <select
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">-- Select a category --</option>
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

          <Col lg={4}>
            <Card>
              <Card.Header>
                <strong>Tips</strong>
              </Card.Header>
              <Card.Body className="p-3" style={{ fontSize: '13px' }}>
                <p>
                  <strong>Template Files (.tpl):</strong><br />
                  Use template variables like <code>{'$!{variable}'}</code> for dynamic content.
                </p>
                <p>
                  <strong>CSS Files:</strong><br />
                  Standard CSS stylesheets linked in the page head.
                </p>
                <p>
                  <strong>JavaScript Files:</strong><br />
                  Client-side scripts loaded at page end.
                </p>
                <hr />
                <p style={{ marginBottom: 0 }}>
                  Use descriptive filenames. Avoid spaces and special characters.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Content */}
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
                  placeholder="Paste your template content here..."
                  required
                  disabled={loading}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Actions */}
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
