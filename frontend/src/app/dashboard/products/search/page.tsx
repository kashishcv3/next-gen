'use client';

import { useState } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Form } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  prod_id: number;
  sku: string;
  prod_name: string;
  is_parent: string;
  parent: number;
  inactive: string;
  ext_id: string;
}

export default function ProductSearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/search', {
        params: {
          q: searchQuery,
          limit: limit,
        },
      });
      setProducts(response.data.results || []);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" fluid>
      <Row className="mb-4">
        <Col>
          <h1>Search Products</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => router.push('/dashboard/products/list')}>
            <i className="fa fa-sitemap"></i> By Category
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/products/by-name')}>
            <i className="fa fa-list"></i> By Name
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <Form.Label>Search by Name, SKU, or Alt ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Limit Results</Form.Label>
              <Form.Select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                <option value={10}>10 results</option>
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
                <option value={100}>100 results</option>
                <option value={500}>500 results</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              Search
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {hasSearched && (
        <Card>
          <Card.Body>
            {products.length === 0 ? (
              <Alert variant="info">No products found</Alert>
            ) : (
              <>
                <p className="text-muted">Found {products.length} product(s)</p>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Alt ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.prod_id}>
                        <td>{product.prod_name}</td>
                        <td>{product.sku}</td>
                        <td>{product.ext_id}</td>
                        <td>
                          {product.is_parent === 'y' && <Badge bg="info">Parent</Badge>}
                          {product.parent && <Badge bg="warning">Child</Badge>}
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
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
