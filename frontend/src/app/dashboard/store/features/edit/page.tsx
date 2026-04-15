'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';

interface FeatureData {
  name: string;
  build: string;
  title: string;
  description: string;
  date_entered: string;
  cost: string;
  link: string;
  info: string;
  noupgrade: string;
  live: string;
  dashboard: string;
  type: string;
  prereqs: string[];
}

export default function StoreFeaturesEditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { siteId } = useStore();
  const { user } = useAuth();
  const featureName = searchParams.get('name') || '';
  const isExisting = featureName !== '';

  const [form, setForm] = useState<FeatureData>({
    name: '',
    build: '',
    title: '',
    description: '',
    date_entered: '',
    cost: '',
    link: '',
    info: '',
    noupgrade: '',
    live: '',
    dashboard: '',
    type: 'new_feature',
    prereqs: [],
  });
  const [upgrades, setUpgrades] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [featureName]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load template upgrades for prerequisites dropdown
      try {
        const upgRes = await api.get('/store-features/upgrades');
        setUpgrades(upgRes.data || {});
      } catch (e) {
        // Non-critical
      }

      // If editing existing feature, load its data
      if (isExisting) {
        const res = await api.get(`/store-features/feature/${encodeURIComponent(featureName)}`);
        setForm(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load feature');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNoupgradeChange = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      noupgrade: checked ? 'y' : '',
      cost: checked ? '' : prev.cost,
    }));
  };

  const handlePrereqsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setForm(prev => ({ ...prev, prereqs: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post('/store-features/edit', {
        ...form,
        prereqs: form.prereqs.join(','),
        existing: isExisting ? 'y' : 'n',
      });
      router.push('/dashboard/store/features');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save feature');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  // Sort upgrades alphabetically by title
  const sortedUpgrades = Object.entries(upgrades).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add/Edit Store Feature</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Feature Information
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isExisting}
                  />
                </div>
                <div className="form-group">
                  <label>Build</label>
                  <input
                    type="text"
                    name="build"
                    className="form-control"
                    value={form.build}
                    onChange={(e) => handleChange('build', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    name="date_entered"
                    className="form-control"
                    value={form.date_entered}
                    onChange={(e) => handleChange('date_entered', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input
                    type="text"
                    name="cost"
                    className="form-control"
                    value={form.cost}
                    onChange={(e) => handleChange('cost', e.target.value)}
                    disabled={form.noupgrade === 'y'}
                  />
                </div>
                <div className="form-group">
                  <label>Link</label>
                  <input
                    type="text"
                    name="link"
                    className="form-control"
                    value={form.link}
                    onChange={(e) => handleChange('link', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Info</label>
                  <textarea
                    name="info"
                    cols={50}
                    rows={10}
                    className="form-control"
                    value={form.info}
                    onChange={(e) => handleChange('info', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.noupgrade === 'y'}
                      onChange={(e) => handleNoupgradeChange(e.target.checked)}
                    />{' '}
                    This feature does not require an upgrade.
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.live === 'y'}
                      onChange={(e) => handleChange('live', e.target.checked ? 'y' : '')}
                    />{' '}
                    Show this feature description in the admin.
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.dashboard === 'y'}
                      onChange={(e) => handleChange('dashboard', e.target.checked ? 'y' : '')}
                    />{' '}
                    Show this feature in the Dashboard
                  </label>
                </div>
                <div className="form-group">
                  <label>This item is a</label>
                  <br />
                  <label style={{ fontWeight: 'normal', marginRight: '15px' }}>
                    <input
                      type="radio"
                      name="type"
                      value="new_feature"
                      checked={form.type === 'new_feature' || form.type === ''}
                      onChange={(e) => handleChange('type', e.target.value)}
                    />{' '}
                    New Feature
                  </label>
                  <br />
                  <label style={{ fontWeight: 'normal', marginRight: '15px' }}>
                    <input
                      type="radio"
                      name="type"
                      value="improvement"
                      checked={form.type === 'improvement'}
                      onChange={(e) => handleChange('type', e.target.value)}
                    />{' '}
                    Improvement
                  </label>
                  <br />
                  <label style={{ fontWeight: 'normal' }}>
                    <input
                      type="radio"
                      name="type"
                      value="fix"
                      checked={form.type === 'fix'}
                      onChange={(e) => handleChange('type', e.target.value)}
                    />{' '}
                    Fix
                  </label>
                </div>
                <div className="form-group">
                  <label>Prerequisites</label>
                  <select
                    name="prereqs"
                    multiple
                    size={10}
                    className="form-control"
                    value={form.prereqs}
                    onChange={handlePrereqsChange}
                  >
                    {sortedUpgrades.map(([name, title]) => (
                      <option key={name} value={name}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
