'use client';

import { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card, Form, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function ProductImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      setSuccess('Products imported successfully');
      setFile(null);
      setTimeout(() => router.push('/dashboard/products/list'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Import Products</h1>
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
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select CSV File to Import</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Supported formats: CSV, XLSX, XLS
              </Form.Text>
            </Form.Group>

            {file && (
              <Form.Group className="mb-3">
                <p className="text-muted">
                  Selected file: <strong>{file.name}</strong>
                </p>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Update existing products"
                defaultChecked={false}
              />
              <Form.Check
                type="checkbox"
                label="Skip products with errors"
                defaultChecked={true}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading || !file}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              Import Products
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5>Import Template</h5>
        </Card.Header>
        <Card.Body>
          <p>Your CSV file should include these columns:</p>
          <ul>
            <li>prod_name - Product Name (required)</li>
            <li>sku - SKU</li>
            <li>ext_id - Alternate ID</li>
            <li>description - Product Description</li>
            <li>retail - Retail (y/n)</li>
            <li>wholesale - Wholesale (y/n)</li>
            <li>featured - Featured (y/n)</li>
            <li>new - New (y/n)</li>
            <li>inactive - Inactive Status</li>
          </ul>
          <Button variant="outline-primary" size="sm">
            <i className="fa fa-download"></i> Download Template
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
