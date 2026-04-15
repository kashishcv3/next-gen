'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Badge, Form } from '@/lib/react-bootstrap';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Category {
  cat_id: number;
  name: string;
  url_name: string;
  rank: number;
  inactive: string;
  count: number;
  level?: number;
  subcat?: Category[];
  linked_to?: string;
}

export default function CategoriesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [reorderAll, setReorderAll] = useState(false);

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

  const toggleCategory = (catId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (cats: Category[]) => {
      cats.forEach((cat) => {
        allIds.add(cat.cat_id);
        if (cat.subcat && cat.subcat.length > 0) {
          collectIds(cat.subcat);
        }
      });
    };
    collectIds(categories);
    setExpandedCategories(allIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const rankData: Record<string, number> = {};

      formData.forEach((value, key) => {
        if (key.startsWith('rank_')) {
          rankData[key] = parseInt(value.toString());
        }
      });

      await api.post('/categories/adjust-order', {
        ranks: rankData,
        reorder_all: reorderAll,
      });
      alert('Categories reordered successfully');
      fetchCategories();
    } catch (err) {
      alert('Failed to reorder categories');
    }
  };

  const deleteCategory = async (catId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${catId}`);
        alert('Category deleted successfully');
        fetchCategories();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    }
  };

  const renderCategories = (cats: Category[], level: number = 0): React.ReactNode[] => {
    return cats.map((cat) => [
      <tr key={`cat_${cat.cat_id}`}>
        <td style={{ paddingLeft: `${level * 20}px`, width: '45%' }}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '45%' }}>
                  {cat.subcat && cat.subcat.length > 0 ? (
                    <a
                      href="javascript:void(0)"
                      onClick={() => toggleCategory(cat.cat_id)}
                      style={{ textDecoration: 'none' }}
                    >
                      <i
                        id={`cat_${cat.cat_id}_icon`}
                        className={`fa fa-${expandedCategories.has(cat.cat_id) ? 'minus' : 'plus'}-square`}
                        onClick={() => toggleCategory(cat.cat_id)}
                      ></i>
                    </a>
                  ) : (
                    <i className="fa fa-minus-square"></i>
                  )}
                  {' '}
                  <a href={`/dashboard/categories/edit/${cat.cat_id}`}>
                    {cat.name}
                  </a>
                  {cat.linked_to && (
                    <>
                      {' '}
                      <span style={{ color: '#ff0000' }}>
                        <a href={`/dashboard/categories/edit/${cat.linked_to}`}>
                          (linked category)
                        </a>
                      </span>
                    </>
                  )}
                  {cat.inactive === 'y' && (
                    <>
                      {' '}
                      <span style={{ color: '#ff0000' }}>(invisible)</span>
                    </>
                  )}
                </td>
                <td style={{ width: '25%', textAlign: 'left' }}>{cat.url_name}</td>
                <td style={{ width: '10%', textAlign: 'center' }}>
                  <Form.Control
                    type="text"
                    className="form-control-inline"
                    name={`rank_${cat.cat_id}`}
                    defaultValue={cat.rank || 0}
                    size="sm"
                    style={{ fontSize: '10px', width: '60px' }}
                  />
                </td>
                <td style={{ width: '10%', textAlign: 'center' }}>
                  <strong>{cat.count || 0}</strong>
                </td>
                <td style={{ width: '10%', textAlign: 'center' }}>
                  <strong>{cat.cat_id}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          {cat.subcat && cat.subcat.length > 0 && expandedCategories.has(cat.cat_id) && (
            <div id={`cat_${cat.cat_id}_panel`}>
              <table style={{ width: '100%' }}>
                <tbody>{renderCategories(cat.subcat, level + 1)}</tbody>
              </table>
            </div>
          )}
        </td>
      </tr>,
    ]);
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
          <h1>Categories</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage your Product Categories to make navigation easier for your customers and inventory management easier for you.
          </p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col lg={12}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/dashboard/categories/add')}
          >
            <i className="fa fa-plus"></i> Add Category
          </Button>{' '}
          <Button
            variant="danger"
            size="sm"
            onClick={() => router.push('/dashboard/categories/delete')}
          >
            <i className="fa fa-trash"></i> Delete Category
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col lg={12}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="me-2"
              onClick={expandAll}
            >
              <i className="fa fa-expand"></i> Expand All
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={collapseAll}
            >
              <i className="fa fa-compress"></i> Collapse All
            </Button>
            <div className="float-end">
              <Form.Check
                type="checkbox"
                id="reorderAll"
                label="Check here if you are reordering all categories"
                checked={reorderAll}
                onChange={(e) => setReorderAll(e.target.checked)}
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={12}>
            <Button type="submit" variant="primary" id="topBtn">
              Submit
            </Button>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div className="table-responsive">
              {categories.length === 0 ? (
                <Alert variant="info">No categories found</Alert>
              ) : (
                <Table hover striped className="cv3-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%', textAlign: 'left' }}>Category</th>
                      <th style={{ width: '25%', textAlign: 'left' }}>URL Name</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Adjust Order</th>
                      <th style={{ width: '10%', textAlign: 'center' }}># of Products</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>ID #</th>
                    </tr>
                  </thead>
                  <tbody>{renderCategories(categories)}</tbody>
                </Table>
              )}
            </div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col lg={12} className="text-center">
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
