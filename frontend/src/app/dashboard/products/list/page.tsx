'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Form, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  prod_id: number;
  prod_name: string;
  sku: string;
  is_parent: string;
  inactive: string;
  has_attributes: string;
  prod_order: number;
  weight: number;
}

interface Category {
  cat_id: number;
  name: string;
  rank: number;
  product_count: number;
  products: Product[];
  expanded: boolean;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/list');
      setCategories(response.data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return (
      <Container className="mt-4" fluid>
        <Row>
          <Col>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Products by Category</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => router.push('/dashboard/products/by-name')}>
            <i className="fa fa-list"></i> By Name
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/products/search')}>
            <i className="fa fa-search"></i> Search
          </Button>{' '}
          <Button variant="success" onClick={() => router.push('/dashboard/products/import')}>
            <i className="fa fa-upload"></i> Import
          </Button>{' '}
          <Button variant="info" onClick={() => router.push('/dashboard/products/export')}>
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
            <div className="list-group">
              {categories.map((category) => (
                <div key={category.cat_id} className="mb-3">
                  <div
                    className="p-3 bg-light border"
                    role="button"
                    onClick={() => toggleCategory(category.cat_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i
                          className={`fa fa-chevron-${
                            expandedCategories.has(category.cat_id) ? 'down' : 'right'
                          }`}
                        ></i>
                        {' '}
                        <strong>{category.name}</strong>
                        {category.inactive && category.inactive !== 'n' && (
                          <Badge bg="warning" className="ms-2">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <Badge bg="secondary">{category.product_count || 0} products</Badge>
                    </div>
                  </div>

                  {expandedCategories.has(category.cat_id) && category.products && (
                    <Table hover size="sm" className="mb-0 mt-2">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.products.map((product) => (
                          <tr key={product.prod_id}>
                            <td>{product.prod_name}</td>
                            <td>{product.sku}</td>
                            <td>
                              {product.is_parent === 'y' && <Badge bg="info">Parent</Badge>}
                              {product.has_attributes === 'y' && <Badge bg="info">Attributes</Badge>}
                            </td>
                            <td>
                              {product.inactive && product.inactive !== 'n' ? (
                                <Badge bg="danger">Inactive</Badge>
                              ) : (
                                <Badge bg="success">Active</Badge>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="sm"
                                onClick={() =>
                                  router.push(`/dashboard/products/edit/${product.prod_id}`)
                                }
                              >
                                <i className="fa fa-edit"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
