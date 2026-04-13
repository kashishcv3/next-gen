'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReviewSettings {
  enable_reviews: boolean;
  require_approval: boolean;
  require_verified_purchase: boolean;
  allow_anonymous: boolean;
  min_rating: number;
  max_rating: number;
}

export default function ProductReviewSettingsPage() {
  const [settings, setSettings] = useState<ReviewSettings>({
    enable_reviews: true,
    require_approval: true,
    require_verified_purchase: false,
    allow_anonymous: true,
    min_rating: 1,
    max_rating: 5,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/reviews/settings');
      setSettings(response.data.data || settings);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/products/reviews/settings', settings);
      setSuccess('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Review Settings</h1>
          <p><i className="fa fa-cog"></i> Configure product review behavior.</p>
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

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Review Settings</h3>
              </div>
              <div className="panel-body">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="enable_reviews"
                      checked={settings.enable_reviews}
                      onChange={handleChange}
                    />
                    Enable product reviews
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="require_approval"
                      checked={settings.require_approval}
                      onChange={handleChange}
                    />
                    Require approval before display
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="require_verified_purchase"
                      checked={settings.require_verified_purchase}
                      onChange={handleChange}
                    />
                    Require verified purchase
                  </label>
                </div>

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="allow_anonymous"
                      checked={settings.allow_anonymous}
                      onChange={handleChange}
                    />
                    Allow anonymous reviews
                  </label>
                </div>

                <hr />

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Minimum Rating</label>
                      <select
                        className="form-control"
                        name="min_rating"
                        value={settings.min_rating}
                        onChange={handleChange}
                      >
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Maximum Rating</label>
                      <select
                        className="form-control"
                        name="max_rating"
                        value={settings.max_rating}
                        onChange={handleChange}
                      >
                        <option value="5">5 Stars</option>
                        <option value="10">10 Stars</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
