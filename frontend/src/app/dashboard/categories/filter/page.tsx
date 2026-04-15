'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Form } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Filter {
  filter_id: number;
  filter_label: string;
  filter_name: string;
}

export default function CategoryFilterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/categories/filters/list');
      setFilters(response.data.filters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filters');
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
          <h1>Category Filters</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/categories/filter/add')}
          >
            <i className="fa fa-plus"></i> Add Filter
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/categories/list')}>
            <i className="fa fa-arrow-left"></i> Back to Categories
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {filters.length === 0 ? (
            <Alert variant="info">No filters found</Alert>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Filter Label</th>
                  <th>Filter Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filters.map((filter) => (
                  <tr key={filter.filter_id}>
                    <td>{filter.filter_label}</td>
                    <td>{filter.filter_name}</td>
                    <td>
                      <Button
                        variant="sm"
                        className="me-1"
                        onClick={() =>
                          router.push(`/dashboard/categories/filter/edit/${filter.filter_id}`)
                        }
                      >
                        <i className="fa fa-edit"></i>
                      </Button>
                      <Button
                        variant="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteFilter(filter.filter_id);
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

const deleteFilter = async (filterId: number) => {
  try {
    await api.delete(`/categories/filters/${filterId}`);
    window.location.reload();
  } catch (err) {
    console.error('Failed to delete filter');
  }
};
