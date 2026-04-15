'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Form, Tabs, Tab, Badge } from '@/lib/react-bootstrap';

interface TemplateListItem {
  name: string;
  filename: string;
  common_name: string;
  category: string;
  last_modified: string | null;
  locked: boolean;
  locked_by: number | null;
  type: string;
}

interface CategorizedTemplates {
  [category: string]: TemplateListItem[];
}

export default function StoreTemplatesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CategorizedTemplates>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(typeParam || 'tpl');

  useEffect(() => {
    fetchTemplates();
  }, [activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map tab keys to API type param
      const typeMap: Record<string, string> = {
        tpl: '',
        css: 'css',
        js: 'js',
        other: 'other',
      };

      const response = await api.get('/store-templates/list', {
        params: { type: typeMap[activeTab] || '' },
      });

      setTemplates(response.data.categories || {});
      setExpandedCategories(new Set());
    } catch (err: any) {
      console.error('Failed to fetch store templates:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(Object.keys(templates)));
    }
    setExpandAll(!expandAll);
  };

  const handleEdit = (filename: string, type: string) => {
    router.push(`/dashboard/store/templates/edit?filename=${encodeURIComponent(filename)}&type=${type}`);
  };

  const handleDelete = async (filename: string, type: string) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/store-templates/${encodeURIComponent(filename)}`, {
        params: { type },
      });
      setSuccess(`Template "${filename}" deleted successfully`);
      setTimeout(() => fetchTemplates(), 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete template');
    }
  };

  const totalCount = Object.values(templates).reduce((acc, items) => acc + items.length, 0);

  const renderCategory = (categoryName: string, items: TemplateListItem[]) => {
    const isExpanded = expandedCategories.has(categoryName);
    const lockedCount = items.filter((t) => t.locked).length;

    return (
      <Card key={categoryName} className="mb-2">
        <Card.Header
          style={{ cursor: 'pointer', padding: '10px 15px' }}
          onClick={() => toggleCategory(categoryName)}
          className="d-flex align-items-center"
        >
          <i className={`fa fa-${isExpanded ? 'minus-square' : 'plus-square'}`} style={{ marginRight: '10px', color: '#337ab7' }}></i>
          <strong>{categoryName}</strong>
          <span className="ms-2" style={{ color: '#888', fontSize: '13px' }}>
            ({items.length} file{items.length !== 1 ? 's' : ''})
            {lockedCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#d9534f' }}>
                <i className="fa fa-lock"></i> {lockedCount} locked
              </span>
            )}
          </span>
        </Card.Header>

        {isExpanded && (
          <div className="table-responsive">
            <Table hover striped className="mb-0 cv3-data-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Common Name</th>
                  <th style={{ width: '25%' }}>Filename</th>
                  <th style={{ width: '18%' }}>Last Modified</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Lock</th>
                  <th style={{ width: '19%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((template, idx) => (
                  <tr key={`${categoryName}_${idx}`}>
                    <td>
                      <a
                        href="javascript:void(0)"
                        onClick={() => handleEdit(template.filename, template.type)}
                        style={{ textDecoration: 'none' }}
                      >
                        {template.common_name || template.filename}
                      </a>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px' }}>{template.filename}</code>
                    </td>
                    <td>
                      <small>
                        {template.last_modified
                          ? new Date(template.last_modified).toLocaleString()
                          : 'N/A'}
                      </small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {template.locked ? (
                        <i className="fa fa-lock" style={{ color: '#d9534f' }} title="Locked"></i>
                      ) : (
                        <i className="fa fa-unlock-alt" style={{ color: '#5cb85c' }} title="Unlocked"></i>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => handleEdit(template.filename, template.type)}
                        style={{ marginRight: '5px' }}
                      >
                        <i className="fa fa-pencil"></i> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(template.filename, template.type)}
                      >
                        <i className="fa fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col lg={12}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p style={{ marginTop: '15px' }}>Loading store templates...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col lg={12}>
          <h1>Store Templates &amp; Files</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage your store&apos;s template files, CSS stylesheets, JavaScript files, and other assets. These files control how your customer-facing store looks and behaves.
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col lg={12}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/dashboard/store/templates/add')}
            style={{ marginRight: '10px' }}
          >
            <i className="fa fa-plus"></i> Add Template
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={toggleExpandAll}
            style={{ marginRight: '10px' }}
          >
            <i className={`fa fa-${expandAll ? 'compress' : 'expand'}`}></i> {expandAll ? 'Collapse' : 'Expand'} All
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/dashboard/store/templates/settings')}
          >
            <i className="fa fa-cog"></i> Store Configuration
          </Button>
          <span className="ms-3" style={{ color: '#888', fontSize: '13px' }}>
            Total: {totalCount} files
          </span>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => {
              if (key) setActiveTab(key);
            }}
            className="mb-3"
          >
            <Tab eventKey="tpl" title={<><i className="fa fa-file-code-o"></i> Templates</>}>
              {Object.keys(templates).length === 0 ? (
                <Alert variant="info">No template files found.</Alert>
              ) : (
                Object.entries(templates).map(([category, items]) => renderCategory(category, items))
              )}
            </Tab>

            <Tab eventKey="css" title={<><i className="fa fa-css3"></i> CSS Stylesheets</>}>
              {Object.keys(templates).length === 0 ? (
                <Alert variant="info">No CSS stylesheets found.</Alert>
              ) : (
                Object.entries(templates).map(([category, items]) => renderCategory(category, items))
              )}
            </Tab>

            <Tab eventKey="js" title={<><i className="fa fa-file-text-o"></i> JavaScript Files</>}>
              {Object.keys(templates).length === 0 ? (
                <Alert variant="info">No JavaScript files found.</Alert>
              ) : (
                Object.entries(templates).map(([category, items]) => renderCategory(category, items))
              )}
            </Tab>

            <Tab eventKey="other" title={<><i className="fa fa-file-o"></i> Other Files</>}>
              {Object.keys(templates).length === 0 ? (
                <Alert variant="info">No other files found.</Alert>
              ) : (
                Object.entries(templates).map(([category, items]) => renderCategory(category, items))
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
