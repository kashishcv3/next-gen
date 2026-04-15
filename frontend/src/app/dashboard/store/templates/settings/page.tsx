'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Container, Row, Col, Button, Alert, Spinner, Card, Form } from '@/lib/react-bootstrap';

interface StoreConfig {
  [key: string]: string;
}

interface ConfigGroup {
  [groupKey: string]: { [key: string]: string };
}

export default function StoreTemplateSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<StoreConfig>({});
  const [groupedConfig, setGroupedConfig] = useState<ConfigGroup>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/store-templates/config');
      const configData = response.data.config || {};
      setConfig(configData);
      groupConfigByPrefix(configData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load store configuration');
    } finally {
      setLoading(false);
    }
  };

  const groupConfigByPrefix = (conf: StoreConfig) => {
    const groups: ConfigGroup = {};

    Object.entries(conf).forEach(([key, value]) => {
      // Group by first part of key before underscore
      const prefix = key.split('_')[0] || 'general';
      const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1) + ' Settings';
      if (!groups[groupName]) groups[groupName] = {};
      groups[groupName][key] = value;
    });

    setGroupedConfig(groups);
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await api.put('/store-templates/config', { config });
      setSuccess('Store configuration saved successfully');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save store configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reload original configuration? Unsaved changes will be lost.')) {
      fetchConfig();
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/store/templates/list');
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
              <p style={{ marginTop: '15px' }}>Loading store configuration...</p>
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
          <h1>Store Configuration (store.conf)</h1>
          <p>
            <i className="fa fa-info-circle"></i> Manage store-wide configuration settings that control template behavior and store appearance.
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

      <form onSubmit={handleSave}>
        {Object.keys(groupedConfig).length === 0 ? (
          <Alert variant="info">No configuration settings found.</Alert>
        ) : (
          Object.entries(groupedConfig).map(([groupName, groupSettings]) => (
            <Row key={groupName} className="mb-3">
              <Col lg={12}>
                <Card>
                  <Card.Header>
                    <strong>{groupName}</strong>
                    <span className="ms-2" style={{ color: '#888', fontSize: '13px' }}>
                      ({Object.keys(groupSettings).length} settings)
                    </span>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <div className="row">
                      {Object.entries(groupSettings).map(([key, value]) => {
                        const isLong = value && value.length > 80;
                        const isTextarea =
                          isLong ||
                          key.includes('description') ||
                          key.includes('content') ||
                          key.includes('html');

                        const label = key
                          .replace(/_/g, ' ')
                          .split(' ')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ');

                        return (
                          <Col key={key} lg={isTextarea ? 12 : 6} className="mb-3">
                            <Form.Group>
                              <Form.Label>{label}</Form.Label>
                              {isTextarea ? (
                                <textarea
                                  className="form-control"
                                  value={config[key] || ''}
                                  onChange={(e) => handleConfigChange(key, e.target.value)}
                                  rows={3}
                                  disabled={saving}
                                  style={{ fontFamily: "'Courier New', monospace", fontSize: '12px' }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  className="form-control"
                                  value={config[key] || ''}
                                  onChange={(e) => handleConfigChange(key, e.target.value)}
                                  disabled={saving}
                                />
                              )}
                              <Form.Text className="text-muted">
                                <code>{key}</code>
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ))
        )}

        <Row className="mb-3">
          <Col lg={12}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="primary" type="submit" disabled={saving}>
                <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button variant="default" type="button" onClick={handleReset} disabled={saving}>
                <i className="fa fa-refresh"></i> Reload
              </Button>
              <Button variant="default" type="button" onClick={handleCancel} disabled={saving}>
                <i className="fa fa-times"></i> Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </form>
    </Container>
  );
}
