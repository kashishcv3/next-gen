'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

interface MOMBuilderEdit {
  id: string;
  name: string;
  description: string;
  status: string;
  enabled: boolean;
}

export default function OrderMOMBuilderEditPage() {
  const params = useParams();
  const router = useRouter();
  const builderId = params.id as string;
  const [builder, setBuilder] = useState<MOMBuilderEdit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (builderId) {
      fetchBuilder();
    }
  }, [builderId]);

  const fetchBuilder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/mom-builders/${builderId}`);
      setBuilder(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch builder:', err);
      setError('Failed to load MOM builder');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!builder) return;

    try {
      setSaving(true);
      await api.put(`/orders/mom-builders/${builderId}`, builder);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push('/orders/mom-builder');
      }, 2000);
    } catch (err) {
      console.error('Failed to save builder:', err);
      setError('Failed to save MOM builder');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading MOM builder...</div></div>;
  }

  if (error && !builder) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-danger">{error}</div></div>;
  }

  if (!builder) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-warning">MOM builder not found</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit MOM Builder</h1>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">MOM builder saved successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">MOM Builder Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Builder Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={builder.name}
                  onChange={(e) => setBuilder({ ...builder, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  value={builder.description}
                  onChange={(e) => setBuilder({ ...builder, description: e.target.value })}
                  rows={4}
                  placeholder="Describe this MOM builder"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  value={builder.status}
                  onChange={(e) => setBuilder({ ...builder, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={builder.enabled}
                    onChange={(e) => setBuilder({ ...builder, enabled: e.target.checked })}
                  />
                  Enable this MOM Builder
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save"></i> Save Changes
                    </>
                  )}
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.push('/orders/mom-builder')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Help</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>MOM Builder:</strong> Configure Multiple Order Manager builders for organizing products and categories.
              </p>
              <hr />
              <p>
                After saving, you can manage categories and products associated with this builder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
