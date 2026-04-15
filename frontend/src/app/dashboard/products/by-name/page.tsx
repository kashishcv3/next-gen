'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Form } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  prod_id: number;
  sku: string;
  prod_name: string;
  is_parent: string;
  inactive: string;
  has_attributes: string;
}

export default function ProductsByNamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState('prod_name');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [sort, searchType, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('sort', sort);
      if (searchType && searchTerm) {
        params.append('search_type', searchType);
        params.append('search_term', searchTerm);
      }
      const response = await api.get(`/products/by-name?${params.toString()}`);
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (type: string) => {
    setSearchType('type');
    setSearchTerm(type);
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
          <h1>Products by Name</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => router.push('/dashboard/products/list')}>
            <i className="fa fa-sitemap"></i> By Category
          </Button>{' '}
          <Button variant="primary" onClick={() => router.push('/dashboard/products/search')}>
            <i className="fa fa-search"></i> Search
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <h5>Quick Filters</h5>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => handleQuickFilter('featured')}
          >
            Featured
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => handleQuickFilter('special')}
          >
            On Special
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => handleQuickFilter('new')}
          >
            New
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-2"
            onClick={() => handleQuickFilter('active')}
          >
            Active
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleQuickFilter('inactive')}
          >
            Inactive
          </Button>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table hover>
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
              {products.map((product) => (
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
                      onClick={() => router.push(`/dashboard/products/edit/${product.prod_id}`)}
                    >
                      <i className="fa fa-edit"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
