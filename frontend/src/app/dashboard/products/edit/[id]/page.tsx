'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Alert,
  Spinner,
  Nav,
  Tab,
  Badge,
  Table,
} from '@/lib/react-bootstrap';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  prod_id?: number;
  prod_name: string;
  sku: string;
  ext_id?: string;
  url_name?: string;
  prod_description?: string;
  stock_status?: string;
  backordered_date?: string;
  inactive?: string;
  retail?: string;
  wholesale?: string;
  shipping_weight?: string;
  unit?: string;
  keywords?: string;
  meta_keywords?: string;
  meta_title?: string;
  meta_description?: string;
  template?: string;
  desc_header?: string;
  brand?: string;
  manufacturer?: string;
  default_category?: number;
  date_created?: string;
  last_modified?: string;
  is_parent?: string;
  has_attributes?: string;
  images?: any[];
  categories?: any[];
  pricing?: any;
  shipping?: any;
}

interface Category {
  cat_id: number;
  name: string;
}

interface FormOptions {
  stock_status?: any[];
  units?: any[];
  templates?: any[];
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<Product>({
    prod_name: '',
    sku: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [options, setOptions] = useState<FormOptions>({});
  const [activeTab, setActiveTab] = useState('core');

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch product if editing
      if (productId) {
        const prodRes = await api.get(`/products/${productId}`);
        setProduct(prodRes.data);
      }

      // Fetch categories
      const catRes = await api.get('/categories/list');
      const catList = flattenCategories(catRes.data.categories || []);
      setCategories(catList);

      // Fetch options
      const optRes = await api.get('/products/options');
      setOptions(optRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const flattenCategories = (cats: any[], result: Category[] = []): Category[] => {
    cats.forEach((cat) => {
      result.push({ cat_id: cat.cat_id, name: cat.name });
      if (cat.subcat && cat.subcat.length > 0) {
        flattenCategories(cat.subcat, result);
      }
    });
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: checked ? 'y' : 'n',
    }));
  };

  const handleCategoryChange = (catId: number, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, catId];
      } else {
        return prev.filter((id) => id !== catId);
      }
    });
  };

  const handleSave = async (closeAfter: boolean = false) => {
    try {
      setError(null);
      setSuccess(null);

      const productData = {
        ...product,
        categories: selectedCategories,
      };

      if (productId) {
        await api.put(`/products/${productId}`, productData);
        setSuccess('Product updated successfully');
      } else {
        const res = await api.post('/products', productData);
        setProduct((prev) => ({ ...prev, prod_id: res.data.prod_id }));
        setSuccess('Product created successfully');
      }

      if (closeAfter) {
        setTimeout(() => router.push('/dashboard/products/list'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
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
      <Row className="mb-3">
        <Col lg={12}>
          <h1>Add/Edit Product</h1>
          <Alert variant="warning">
            <strong>Note</strong> Please click save buttons only once when saving changes.
          </Alert>
          <Alert variant="warning">
            <strong>Note</strong> Any changes will be reflected on your site within 5 minutes.
          </Alert>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col lg={12}>
          <p>
            <i className="fa fa-code"></i> = HTML Allowed
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('core')}
            className="me-2"
          >
            <i className="fa fa-expand"></i> Expand All
          </Button>
        </Col>
      </Row>

      <Form>
        <Row className="mb-3">
          <Col lg={12}>
            <Button
              variant="primary"
              className="me-2"
              onClick={() => handleSave(false)}
            >
              <i className="fa fa-save"></i> Save and Return
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
            >
              <i className="fa fa-save"></i> Save and Close
            </Button>
          </Col>
        </Row>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'core')}>
          <Row>
            <Col lg={12}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="core">
                    <i className="fa fa-cogs"></i> Core Product Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="display">
                    <i className="fa fa-eye"></i> Display
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="pricing">
                    <i className="fa fa-dollar"></i> Pricing
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="shipping">
                    <i className="fa fa-truck"></i> Shipping
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="images">
                    <i className="fa fa-image"></i> Images
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="categories">
                    <i className="fa fa-folder"></i> Categories
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reviews">
                    <i className="fa fa-star"></i> Reviews
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>

          <Tab.Content>
            {/* Core Product Info Tab */}
            <Tab.Pane eventKey="core">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-cogs"></i> Core Product Info
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {product.prod_id && (
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Prod ID:</strong>
                      </Form.Label>
                      <Form.Control plaintext readOnly value={product.prod_id} />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Product Type</Form.Label>
                    <Form.Select name="product_type" onChange={handleInputChange}>
                      <option value="product">Regular</option>
                      <option value="content">Content Only</option>
                      <option value="build">Build a Product</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="prod_name"
                      value={product.prod_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col lg={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SKU</Form.Label>
                        <Form.Control
                          type="text"
                          name="sku"
                          value={product.sku}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Alt. ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="ext_id"
                          value={product.ext_id || ''}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {product.date_created && (
                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <strong>Date Created:</strong> {product.date_created}
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <strong>Last Modified:</strong> {product.last_modified}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {product.prod_id && (
                    <Form.Group className="mb-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/product/${product.prod_id}`,
                            '_blank'
                          )
                        }
                      >
                        <i className="fa fa-external-link-square"></i> View on Staging
                      </Button>
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Display Tab */}
            <Tab.Pane eventKey="display">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-eye"></i> Display Settings
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>URL Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="url_name"
                      value={product.url_name || ''}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Google recommends using dashes, not underscores. Numbers are allowed but there must be at least one non-numeric character.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Product Template</Form.Label>
                    <Form.Select name="template" onChange={handleInputChange}>
                      <option value="">Select Template</option>
                      {options.templates &&
                        Object.entries(options.templates).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Description Header <i className="fa fa-code"></i>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="desc_header"
                      value={product.desc_header || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={product.brand || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Manufacturer</Form.Label>
                    <Form.Control
                      type="text"
                      name="manufacturer"
                      value={product.manufacturer || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Full Description <i className="fa fa-code"></i>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={8}
                      name="prod_description"
                      value={product.prod_description || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Stock Status</Form.Label>
                    <Form.Select
                      name="stock_status"
                      onChange={handleInputChange}
                    >
                      <option value="">Select Status</option>
                      {options.stock_status &&
                        Object.entries(options.stock_status).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Backordered Date</Form.Label>
                    <Form.Control
                      type="text"
                      name="backordered_date"
                      value={product.backordered_date || ''}
                      onChange={handleInputChange}
                      placeholder="MM/DD/YYYY"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="inactive"
                      name="inactive"
                      label="Inactive"
                      checked={product.inactive === 'y'}
                      onChange={handleCheckboxChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="retail"
                      name="retail"
                      label="Retail Product"
                      checked={product.retail === 'y'}
                      onChange={handleCheckboxChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="wholesale"
                      name="wholesale"
                      label="Wholesale Product"
                      checked={product.wholesale === 'y'}
                      onChange={handleCheckboxChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Display Weight</Form.Label>
                    <Form.Control
                      type="text"
                      name="shipping_weight"
                      value={product.shipping_weight || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Unit</Form.Label>
                    <Row>
                      <Col lg={6}>
                        <Form.Select
                          name="unit"
                          onChange={handleInputChange}
                        >
                          <option value="">Select Unit</option>
                          {options.units &&
                            Object.entries(options.units).map(
                              ([key, label]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              )
                            )}
                        </Form.Select>
                      </Col>
                      <Col lg={6}>
                        <Form.Control
                          type="text"
                          name="new_unit"
                          placeholder="Or create a new one"
                          onChange={handleInputChange}
                        />
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Search Keywords</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="keywords"
                      value={product.keywords || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Meta Keywords</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="meta_keywords"
                      value={product.meta_keywords || ''}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      (for use with dynamic meta data)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Meta Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="meta_title"
                      value={product.meta_title || ''}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      (for use with dynamic meta data - leave blank to use category and product names)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Meta Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="meta_description"
                      value={product.meta_description || ''}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      (for use with dynamic meta data - leave blank to use product description)
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Pricing Tab */}
            <Tab.Pane eventKey="pricing">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-dollar"></i> Pricing
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    Pricing settings will be configured here
                  </Alert>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Shipping Tab */}
            <Tab.Pane eventKey="shipping">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-truck"></i> Shipping
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    Shipping settings will be configured here
                  </Alert>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Images Tab */}
            <Tab.Pane eventKey="images">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-image"></i> Images & Media
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    Image management will be configured here
                  </Alert>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Categories Tab */}
            <Tab.Pane eventKey="categories">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-folder"></i> Categories
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Categories</Form.Label>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                      {categories.map((cat) => (
                        <Form.Check
                          key={cat.cat_id}
                          type="checkbox"
                          id={`cat_${cat.cat_id}`}
                          label={cat.name}
                          checked={selectedCategories.includes(cat.cat_id)}
                          onChange={(e) =>
                            handleCategoryChange(cat.cat_id, e.target.checked)
                          }
                        />
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Default Category</Form.Label>
                    <Form.Select
                      name="default_category"
                      onChange={handleInputChange}
                      value={product.default_category || ''}
                    >
                      <option value="">
                        {selectedCategories.length > 0
                          ? '- Select a Category -'
                          : '- No Categories Selected Above -'}
                      </option>
                      {selectedCategories.length > 0 &&
                        categories
                          .filter((cat) =>
                            selectedCategories.includes(cat.cat_id)
                          )
                          .map((cat) => (
                            <option key={cat.cat_id} value={cat.cat_id}>
                              {cat.name}
                            </option>
                          ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      You may only select a default category from the categories this product is currently in.
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Reviews Tab */}
            <Tab.Pane eventKey="reviews">
              <Card className="mb-3">
                <Card.Header>
                  <Card.Title className="mb-0">
                    <i className="fa fa-star"></i> Product Reviews
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    Product reviews will be displayed here
                  </Alert>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <Row className="mt-4">
          <Col lg={12}>
            <Button
              variant="primary"
              className="me-2"
              onClick={() => handleSave(false)}
            >
              <i className="fa fa-save"></i> Save and Return
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
            >
              <i className="fa fa-save"></i> Save and Close
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
