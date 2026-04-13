'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface Feature {
  id: string;
  name: string;
  description: string;
  settings: Record<string, any>;
}

interface FormData {
  name: string;
  description: string;
  settings: Record<string, string>;
}

export default function FeatureEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const featureId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    settings: {},
  });

  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (featureId) {
      fetchFeature();
    }
  }, [featureId]);

  const fetchFeature = async () => {
    try {
      const res = await api.get(`/store/features/${featureId}`);
      const featureData = res.data.data;
      setFeature(featureData);
      setFormData({
        name: featureData.name,
        description: featureData.description,
        settings: featureData.settings || {},
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feature');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put(`/store/features/${featureId}`, {
        name: formData.name,
        description: formData.description,
        settings: formData.settings,
      });
      router.push('/store/features');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update feature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Edit Feature</h1>
          <p>
            <i className="fa fa-info-circle"></i> Modify feature settings.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-edit"></i> Feature Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Feature Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                {Object.entries(formData.settings).map(([key, value]) => (
                  <div key={key} className="form-group">
                    <label>{key}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={value as string}
                      onChange={(e) => handleSettingChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <a href="/store/features" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
