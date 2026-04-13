'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SitemapSettings {
  enabled: boolean;
  update_frequency: string;
  priority: number;
  include_products: boolean;
  include_categories: boolean;
  include_pages: boolean;
}

export default function StoreGoogleSitemapPage() {
  const [settings, setSettings] = useState<SitemapSettings>({
    enabled: true,
    update_frequency: 'weekly',
    priority: 0.8,
    include_products: true,
    include_categories: true,
    include_pages: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/store/google-sitemap');
      setSettings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/store/google-sitemap', settings);
      alert('Sitemap settings saved');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Google Sitemap</h1>
          <p><i className="fa fa-info-circle"></i> Configure XML sitemap generation.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-sitemap"></i> Sitemap Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="enabled" checked={settings.enabled} onChange={handleInputChange} />
                    Enable Sitemap
                  </label>
                </div>

                <div className="form-group">
                  <label>Update Frequency</label>
                  <select className="form-control" name="update_frequency" value={settings.update_frequency} onChange={handleInputChange}>
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority (0.0-1.0)</label>
                  <input type="number" className="form-control" name="priority" value={settings.priority} onChange={handleInputChange} step="0.1" min="0" max="1" />
                </div>

                <hr />

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="include_products" checked={settings.include_products} onChange={handleInputChange} />
                    Include Products
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="include_categories" checked={settings.include_categories} onChange={handleInputChange} />
                    Include Categories
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="include_pages" checked={settings.include_pages} onChange={handleInputChange} />
                    Include Pages
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
