'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Form {
  id: number;
  name: string;
  form_type: string;
  description: string;
  last_modified: string;
}

export default function TemplateFormsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/templates/forms');
      setForms(response.data.forms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4" fluid>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Template Forms</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/templates/forms/add')}
          >
            <i className="fa fa-plus"></i> Add Form
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/templates/list')}>
            <i className="fa fa-arrow-left"></i> Back to Templates
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {forms.length === 0 ? (
            <Alert variant="info">No forms found</Alert>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Form Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>{form.name}</td>
                    <td>
                      <Badge bg="info">{form.form_type}</Badge>
                    </td>
                    <td>{form.description}</td>
                    <td>{form.last_modified}</td>
                    <td>
                      <Button
                        variant="sm"
                        className="me-1"
                        onClick={() =>
                          router.push(`/dashboard/templates/forms/edit/${form.id}`)
                        }
                      >
                        <i className="fa fa-edit"></i>
                      </Button>
                      <Button
                        variant="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteForm(form.id);
                          }
                        }}
                      >
                        <i className="fa fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

const deleteForm = async (formId: number) => {
  try {
    await api.delete(`/templates/forms/${formId}`);
    window.location.reload();
  } catch (err) {
    console.error('Failed to delete form');
  }
};
