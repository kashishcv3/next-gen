'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Category {
  cat_id: number;
  name: string;
  url_name: string;
  rank: number;
  inactive: string;
  count: number;
  level: number;
  subcat: Category[];
}

export default function CategoriesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/categories/list');
      setCategories(response.data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const renderCategories = (categories: Category[], level: number = 0) => {
    return (
      <>
        {categories.map((cat) => (
          <div key={cat.cat_id}>
            <tr>
              <td style={{ paddingLeft: `${level * 20}px` }}>
                {cat.subcat && cat.subcat.length > 0 && (
                  <i className="fa fa-folder"></i>
                )}
                {' '}
                {cat.name}
              </td>
              <td>{cat.url_name}</td>
              <td>{cat.rank}</td>
              <td>{cat.count}</td>
              <td>
                {cat.inactive && cat.inactive !== 'n' ? (
                  <Badge bg="warning">Inactive</Badge>
                ) : (
                  <Badge bg="success">Active</Badge>
                )}
              </td>
              <td>
                <Button
                  variant="sm"
                  className="me-1"
                  onClick={() => router.push(`/dashboard/categories/edit/${cat.cat_id}`)}
                >
                  <i className="fa fa-edit"></i>
                </Button>
                <Button
                  variant="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('Are you sure?')) {
                      deleteCategory(cat.cat_id);
                    }
                  }}
                >
                  <i className="fa fa-trash"></i>
                </Button>
              </td>
            </tr>
            {cat.subcat && cat.subcat.length > 0 && renderCategories(cat.subcat, level + 1)}
          </div>
        ))}
      </>
    );
  };

  const deleteCategory = async (catId: number) => {
    try {
      await api.delete(`/categories/${catId}`);
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
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
          <h1>Categories</h1>
        </Col>
        <Col xs="auto">
          <Button
            variant="success"
            onClick={() => router.push('/dashboard/categories/add')}
          >
            <i className="fa fa-plus"></i> Add Category
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/categories/filter')}>
            <i className="fa fa-filter"></i> Filters
          </Button>{' '}
          <Button variant="info" onClick={() => router.push('/dashboard/categories/import')}>
            <i className="fa fa-upload"></i> Import
          </Button>{' '}
          <Button variant="info" onClick={() => router.push('/dashboard/categories/export')}>
            <i className="fa fa-download"></i> Export
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {categories.length === 0 ? (
            <Alert variant="info">No categories found</Alert>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>URL Name</th>
                  <th>Rank</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderCategories(categories)}</tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
