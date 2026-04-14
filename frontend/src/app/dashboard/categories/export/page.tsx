'use client';

import { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card, Form, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function CategoryExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportType, setExportType] = useState('all');
  const [includeProducts, setIncludeProducts] = useState(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/categories/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          export_type: exportType,
          include_products: includeProducts,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories-export-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Categories exported successfully');
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
          <h1>Export Categories</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => router.push('/dashboard/categories/list')}>
            <i className="fa fa-arrow-left"></i> Back to Categories
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
                  label="All Categories"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Active Categories Only"
                  name="exportType"
                  value="active"
                  checked={exportType === 'active'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="Main Categories Only"
                  name="exportType"
                  value="main"
                  checked={exportType === 'main'}
                  onChange={(e) => setExportType(e.target.value)}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Products in Each Category"
                checked={includeProducts}
                onChange={() => setIncludeProducts(!includeProducts)}
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
