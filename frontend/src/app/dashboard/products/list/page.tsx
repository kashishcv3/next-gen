'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Badge, Form } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Product {
  prod_id: number;
  prod_name: string;
  sku: string;
  is_parent: string;
  inactive: string;
  has_attributes: string;
  prod_order?: number;
  weight?: number;
  rank?: number;
}

interface Category {
  cat_id: number;
  name: string;
  rank: number;
  product_count: number;
  products: Product[];
  expanded?: boolean;
  linked_to?: string;
}

interface StoreSettings {
  category_sort?: string;
}

export default function ProductsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showSpecials, setShowSpecials] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({ category_sort: 'sorted' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsRes = await api.get('/products/list');
      setCategories(productsRes.data.categories || []);

      // Settings endpoint may not exist yet — don't let it block the page
      try {
        const settingsRes = await api.get('/store/settings');
        setSettings(settingsRes.data || { category_sort: 'sorted' });
      } catch {
        setSettings({ category_sort: 'sorted' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
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

  const toggleSpecials = () => {
    setShowSpecials(!showSpecials);
  };

  const handleDeleteProduct = async (prodId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${prodId}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleCopyProduct = (prodId: number) => {
    router.push(`/dashboard/products/copy/${prodId}`);
  };

  const handleAdjustOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const orderData: Record<string, number> = {};

      formData.forEach((value, key) => {
        if (key.startsWith('adj_') || key.startsWith('weight_')) {
          orderData[key] = parseInt(value.toString());
        }
      });

      await api.post('/products/adjust-order', orderData);
      fetchData();
      alert('Product order updated successfully');
    } catch (err) {
      alert('Failed to update product order');
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
          <h1>Products By Category</h1>
          <p>
            <i className="fa fa-info-circle"></i> In the product by category listing you are able to view, edit and remove products and subproducts from your store. Not only can you view your products, but you can manage the order in which your products and subproducts are displayed within their category.
          </p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col lg={12}>
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/edit')}>
            <i className="fa fa-plus"></i> Add Product
          </Button>{' '}
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/copy')}>
            <i className="fa fa-copy"></i> Copy Product
          </Button>{' '}
          <Button variant="danger" size="sm" onClick={() => router.push('/dashboard/products/delete')}>
            <i className="fa fa-trash"></i> Delete Product
          </Button>{' '}
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/products/search')}>
            <i className="fa fa-search"></i> Product Search
          </Button>{' '}
          <Button variant="info" size="sm" onClick={() => router.push('/dashboard/products/custom-fields')}>
            <i className="fa fa-gear"></i> Custom Field Labels
          </Button>{' '}
          <Button
            variant={showSpecials ? 'success' : 'secondary'}
            size="sm"
            onClick={toggleSpecials}
          >
            <i className={`fa fa-${showSpecials ? 'check-' : ''}square`}></i> Display Specials
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleAdjustOrder}>
        <Row className="mb-3">
          <Col lg={12}>
            {settings.category_sort === 'sorted' && (
              <div className="text-center mb-3">
                <Button type="submit" variant="primary" id="topBtn">
                  Adjust Product Order
                </Button>
              </div>
            )}
            {settings.category_sort === 'weighted' && (
              <div className="text-center mb-3">
                <Button type="submit" variant="primary" id="topBtn">
                  Adjust Product Weights
                </Button>
              </div>
            )}
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div className="table-responsive">
              <Table hover striped className="cv3-data-table">
                <thead>
                  <tr>
                    <th colSpan={2}>Products by Category</th>
                    <th className="text-center">
                      {settings.category_sort === 'sorted'
                        ? 'Adjust Order'
                        : settings.category_sort === 'weighted'
                        ? 'Adjust Weight'
                        : ''}
                    </th>
                    <th className="text-center">SKU</th>
                    <th className="text-center">Prod ID</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <React.Fragment key={category.cat_id}>
                      <tr>
                        <td colSpan={3}>
                          {!category.linked_to && category.product_count > 0 ? (
                            <a
                              href="javascript:void(0)"
                              onClick={() => toggleCategory(category.cat_id)}
                              style={{ textDecoration: 'none' }}
                            >
                              {expandedCategories.has(category.cat_id) ? (
                                <i className="fa fa-minus-square"></i>
                              ) : (
                                <i className="fa fa-plus-square"></i>
                              )}
                            </a>
                          ) : (
                            <img src="/images/spacer.gif" alt="spacer" style={{ width: '14px', height: '0px', display: 'inline' }} />
                          )}
                          {' '}
                          {category.linked_to ? (
                            <>
                              <strong>{category.name}</strong> (linked)
                            </>
                          ) : (
                            <a
                              name={`cat_${category.cat_id}`}
                              href="javascript:void(0)"
                              onClick={() => toggleCategory(category.cat_id)}
                            >
                              {category.name}
                            </a>
                          )}
                        </td>
                        <td className="text-center">&nbsp;</td>
                        <td className="text-center">&nbsp;</td>
                      </tr>

                      {expandedCategories.has(category.cat_id) && !category.linked_to && (
                        <>
                          {category.products.map((product) => (
                            <tr key={product.prod_id}>
                              <td>&nbsp;</td>
                              <td>
                                <a href={`/dashboard/products/edit/${product.prod_id}`}>
                                  {product.prod_name || '[no product name]'}
                                </a>
                                {product.is_parent === 'y' && (
                                  <>
                                    {' '}
                                    <Badge bg="secondary">
                                      <a href={`/dashboard/products/${product.prod_id}/subproducts`}>
                                        View Sub-Products
                                      </a>
                                    </Badge>
                                  </>
                                )}
                                {product.has_attributes === 'y' && (
                                  <>
                                    {' '}
                                    <Badge bg="secondary">
                                      <a href={`/dashboard/products/${product.prod_id}/attributes`}>
                                        View Attributes
                                      </a>
                                    </Badge>
                                  </>
                                )}
                                {product.inactive === 'y' && (
                                  <>
                                    {' '}
                                    <Badge bg="danger">Inactive</Badge>
                                  </>
                                )}
                              </td>
                              <td className="text-center">
                                {category.cat_id !== 0 && (
                                  <>
                                    {settings.category_sort === 'sorted' && (
                                      <Form.Control
                                        type="text"
                                        name={`adj_${category.cat_id}_${product.prod_id}_${product.rank || 0}`}
                                        defaultValue={product.rank || 0}
                                        size="sm"
                                        style={{ width: '60px' }}
                                      />
                                    )}
                                    {settings.category_sort === 'weighted' && (
                                      <Form.Control
                                        type="text"
                                        name={`weight_${category.cat_id}_${product.prod_id}_${product.weight || 0}`}
                                        defaultValue={product.weight || 0}
                                        size="sm"
                                        style={{ width: '80px' }}
                                      />
                                    )}
                                  </>
                                )}
                              </td>
                              <td className="text-center">{product.sku}</td>
                              <td className="text-center">{product.prod_id}</td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Online Specials Section */}
                  <tr>
                    <td colSpan={3}>
                      <a
                        href="javascript:void(0)"
                        onClick={toggleSpecials}
                        style={{ textDecoration: 'none' }}
                      >
                        {showSpecials ? (
                          <i className="fa fa-minus-square"></i>
                        ) : (
                          <i className="fa fa-plus-square"></i>
                        )}
                      </a>
                      {' '}
                      <a
                        name="o"
                        href="javascript:void(0)"
                        onClick={toggleSpecials}
                      >
                        Online Specials
                      </a>
                    </td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col lg={12} className="text-center">
            {settings.category_sort === 'sorted' && (
              <Button type="submit" variant="primary">
                Adjust Product Order
              </Button>
            )}
            {settings.category_sort === 'weighted' && (
              <Button type="submit" variant="primary">
                Adjust Product Weights
              </Button>
            )}
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

// Add React import for Fragment
import React from 'react';
