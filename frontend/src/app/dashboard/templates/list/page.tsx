'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Table, Alert, Spinner, Card, Tabs, Tab, Badge } from '@/lib/react-bootstrap';

interface TemplateItem {
  id: number;
  name: string;
  file?: string;
  common?: string;
  template_type: string;
  last_modified: string;
  locked?: { locked_status: string; locked_by?: string };
  changed?: boolean;
}

interface TemplateCategory {
  [category: string]: TemplateItem[];
}

export default function DashboardTemplatesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || 'templates';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateCategory>({});
  const [stylesheets, setStylesheets] = useState<TemplateCategory>({});
  const [javascriptFiles, setJavascriptFiles] = useState<TemplateCategory>({});
  const [otherFiles, setOtherFiles] = useState<TemplateCategory>({});
  const [editLocked, setEditLocked] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [activeTab, setActiveTab] = useState(typeParam);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/templates/list');
      const data = response.data;

      setTemplates(data.templates || {});
      setStylesheets(data.stylesheets || {});
      setJavascriptFiles(data.javascript_files || {});
      setOtherFiles(data.other_files || {});
      setEditLocked(data.edit_locked || false);
      setTotal(data.total || 0);
      setExpandedCategories(new Set());
    } catch (err: any) {
      console.error('Failed to fetch dashboard templates:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const getActiveData = (): TemplateCategory => {
    switch (activeTab) {
      case 'css': return stylesheets;
      case 'js': return javascriptFiles;
      case 'other': return otherFiles;
      default: return templates;
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
    const data = getActiveData();
    if (expandAll) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(Object.keys(data)));
    }
    setExpandAll(!expandAll);
  };

  const handleEdit = (templateId: number) => {
    router.push(`/dashboard/templates/edit?id=${templateId}`);
  };

  const handlePublish = async (templateName: string) => {
    try {
      await api.post(`/templates/${encodeURIComponent(templateName)}/publish`);
      setSuccess(`Template "${templateName}" published`);
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish template');
    }
  };

  const handlePublishAll = async () => {
    if (!window.confirm('Publish all templates? This will make all pending changes live.')) return;
    try {
      await api.post('/templates/publish-all');
      setSuccess('All templates published');
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish all templates');
    }
  };

  const handleDelete = async (templateId: number, templateName: string) => {
    if (!window.confirm(`Delete template "${templateName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/templates/${templateId}`);
      setSuccess(`Template "${templateName}" deleted`);
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete template');
    }
  };

  const renderCategory = (categoryName: string, items: TemplateItem[]) => {
    const isExpanded = expandedCategories.has(categoryName);
    const changedCount = items.filter((t) => t.changed).length;
    const lockedCount = items.filter((t) => t.locked?.locked_status === 'y').length;

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
            ({items.length} template{items.length !== 1 ? 's' : ''})
            {changedCount > 0 && (
              <Badge bg="warning" className="ms-2">{changedCount} pending</Badge>
            )}
            {lockedCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#d9534f' }}>
                <i className="fa fa-lock"></i> {lockedCount}
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
                  <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                  <th style={{ width: '19%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {editLocked ? (
                        <span>{item.common || item.name}</span>
                      ) : (
                        <a
                          href="javascript:void(0)"
                          onClick={() => handleEdit(item.id)}
                          style={{ textDecoration: 'none' }}
                        >
                          {item.common || item.name}
                        </a>
                      )}
                      {item.changed && (
                        <Badge bg="warning" className="ms-2">pending</Badge>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '12px' }}>{item.file || item.name}</code>
                    </td>
                    <td>
                      <small>{item.last_modified || 'N/A'}</small>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.locked?.locked_status === 'y' ? (
                        <i className="fa fa-lock" style={{ color: '#d9534f' }} title={`Locked by ${item.locked.locked_by || 'unknown'}`}></i>
                      ) : (
                        <i className="fa fa-unlock-alt" style={{ color: '#5cb85c' }}></i>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {!editLocked && (
                        <>
                          <Button size="sm" variant="info" onClick={() => handleEdit(item.id)} style={{ marginRight: '4px' }}>
                            <i className="fa fa-pencil"></i>
                          </Button>
                          {item.changed && (
                            <Button size="sm" variant="success" onClick={() => handlePublish(item.name)} style={{ marginRight: '4px' }}>
                              <i className="fa fa-upload"></i>
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id, item.name)}>
                            <i className="fa fa-trash"></i>
                          </Button>
                        </>
                      )}
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
              <p style={{ marginTop: '15px' }}>Loading dashboard templates...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const activeData = getActiveData();

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col lg={12}>
          <h1>Dashboard Template Library</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage dashboard-level templates, stylesheets, and JavaScript files. These templates control the admin platform&apos;s appearance and functionality.
          </p>
        </Col>
      </Row>

      {editLocked && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="warning">
              <strong>Note:</strong> Template editing has been temporarily deactivated. Contact support for modifications.
            </Alert>
          </Col>
        </Row>
      )}

      {error && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row className="mb-3">
          <Col lg={12}>
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col lg={12}>
          {!editLocked && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/dashboard/templates/add')}
                style={{ marginRight: '10px' }}
              >
                <i className="fa fa-plus"></i> Add Template
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handlePublishAll}
                style={{ marginRight: '10px' }}
              >
                <i className="fa fa-upload"></i> Publish All
              </Button>
            </>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={toggleExpandAll}
            style={{ marginRight: '10px' }}
          >
            <i className={`fa fa-${expandAll ? 'compress' : 'expand'}`}></i> {expandAll ? 'Collapse' : 'Expand'} All
          </Button>
          <span style={{ color: '#888', fontSize: '13px' }}>
            Total: {total} templates
          </span>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => {
              if (key) {
                setActiveTab(key);
                setExpandedCategories(new Set());
                setExpandAll(false);
              }
            }}
            className="mb-3"
          >
            <Tab eventKey="templates" title={<><i className="fa fa-file-code-o"></i> Templates</>}>
              {Object.keys(activeData).length === 0 ? (
                <Alert variant="info">No templates found.</Alert>
              ) : (
                Object.entries(activeData).map(([cat, items]) => renderCategory(cat, items))
              )}
            </Tab>

            <Tab eventKey="css" title={<><i className="fa fa-css3"></i> CSS Stylesheets</>}>
              {Object.keys(activeData).length === 0 ? (
                <Alert variant="info">No CSS stylesheets found.</Alert>
              ) : (
                Object.entries(activeData).map(([cat, items]) => renderCategory(cat, items))
              )}
            </Tab>

            <Tab eventKey="js" title={<><i className="fa fa-file-text-o"></i> JavaScript Files</>}>
              {Object.keys(activeData).length === 0 ? (
                <Alert variant="info">No JavaScript files found.</Alert>
              ) : (
                Object.entries(activeData).map(([cat, items]) => renderCategory(cat, items))
              )}
            </Tab>

            <Tab eventKey="other" title={<><i className="fa fa-file-o"></i> Other Files</>}>
              {Object.keys(activeData).length === 0 ? (
                <Alert variant="info">No other files found.</Alert>
              ) : (
                Object.entries(activeData).map(([cat, items]) => renderCategory(cat, items))
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
