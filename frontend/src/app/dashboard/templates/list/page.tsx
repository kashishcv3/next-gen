'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Tabs, Tab } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Template {
  id: number;
  name: string;
  template_type: string;
  last_modified: string;
}

export default function TemplatesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, Template[]>>({});
  const [activeTab, setActiveTab] = useState('html');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/templates/list');
      setTemplates(response.data.templates || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
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

  const templateTypes = Object.keys(templates);

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Template Library</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/templates/add')}
          >
            <i className="fa fa-plus"></i> Add Template
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/templates/tags')}>
            <i className="fa fa-tag"></i> Tags
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/templates/forms')}>
            <i className="fa fa-list"></i> Forms
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Tabs id="template-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'html')}>
            {templateTypes.map((type) => (
              <Tab eventKey={type} title={type} key={type}>
                <Table hover className="mt-3">
                  <thead>
                    <tr>
                      <th>Template Name</th>
                      <th>Type</th>
                      <th>Last Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates[type].map((template) => (
                      <tr key={template.id}>
                        <td>{template.name}</td>
                        <td>
                          <Badge bg="info">{template.template_type}</Badge>
                        </td>
                        <td>{template.last_modified}</td>
                        <td>
                          <Button
                            variant="sm"
                            className="me-1"
                            onClick={() =>
                              router.push(`/dashboard/templates/edit/${template.id}`)
                            }
                          >
                            <i className="fa fa-edit"></i>
                          </Button>
                          <Button
                            variant="sm"
                            variant="danger"
                            onClick={() => {
                              if (confirm('Are you sure?')) {
                                deleteTemplate(template.id);
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
              </Tab>
            ))}
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}

const deleteTemplate = async (templateId: number) => {
  try {
    await api.delete(`/templates/${templateId}`);
    window.location.reload();
  } catch (err) {
    console.error('Failed to delete template');
  }
};
