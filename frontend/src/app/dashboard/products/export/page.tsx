'use client';

import { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card, Form, Spinner } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';

export default function ProductExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportType, setExportType] = useState('all');
  const [includeFields, setIncludeFields] = useState({
    name: true,
    sku: true,
    price: true,
    description: true,
    category: true,
    status: true,
  });

  const handleFieldChange = (field: string) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/products/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          export_type: exportType,
          include_fields: includeFields,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Products exported successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Export Products</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => router.push('/dashboard/products/list')}>
            <i className="fa fa-arrow-left"></i> Back to Products
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleExport}>
            <Form.Group className="mb-3">
              <Form.Label>Export Type</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="All Products"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Active Products Only"
                  name="exportType"
                  value="active"
                  checked={exportType === 'active'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Featured Products Only"
                  name="exportType"
                  value="featured"
                  checked={exportType === 'featured'}
                  onChange={(e) => setExportType(e.target.value)}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fields to Include</Form.Label>
              <Form.Check
                type="checkbox"
                label="Product Name"
                checked={includeFields.name}
                onChange={() => handleFieldChange('name')}
              />
              <Form.Check
                type="checkbox"
                label="SKU"
                checked={includeFields.sku}
                onChange={() => handleFieldChange('sku')}
              />
              <Form.Check
                type="checkbox"
                label="Price"
                checked={includeFields.price}
                onChange={() => handleFieldChange('price')}
              />
              <Form.Check
                type="checkbox"
                label="Description"
                checked={includeFields.description}
                onChange={() => handleFieldChange('description')}
              />
              <Form.Check
                type="checkbox"
                label="Category"
                checked={includeFields.category}
                onChange={() => handleFieldChange('category')}
              />
              <Form.Check
                type="checkbox"
                label="Status"
                checked={includeFields.status}
                onChange={() => handleFieldChange('status')}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              <i className="fa fa-download"></i> Export as CSV
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
