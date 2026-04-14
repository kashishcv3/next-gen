'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Tabs, Tab } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Tag {
  name: string;
  category: string;
}

export default function TemplateTagsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Record<string, Tag[]>>({});

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/templates/tags');
      setTags(response.data.tags || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
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

  const categories = Object.keys(tags);

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Template Tags</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/templates/tags/add')}
          >
            <i className="fa fa-plus"></i> Add Tag
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/templates/list')}>
            <i className="fa fa-arrow-left"></i> Back to Templates
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Tabs id="tag-tabs" defaultActiveKey={categories[0] || 'general'}>
            {categories.map((category) => (
              <Tab eventKey={category} title={category} key={category}>
                <div className="mt-3">
                  {tags[category].map((tag, idx) => (
                    <Badge bg="secondary" key={idx} className="me-2 mb-2">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Tab>
            ))}
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
}
