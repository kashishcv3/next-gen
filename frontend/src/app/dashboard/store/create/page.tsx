'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface StoreTemplate {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'existing';
}

interface FormData {
  name: string;
  display_name: string;
  template_type: 'default' | 'existing';
  template_id?: string;
  sample_data: 'yes' | 'no';
}

export default function StoreCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    display_name: '',
    template_type: 'default',
    sample_data: 'yes',
  });

  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [existingStores, setExistingStores] = useState<StoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockAddStores, setLockAddStores] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [templatesRes, storesRes, lockRes] = await Promise.all([
        api.get('/store/templates'),
        api.get('/store/list'),
        api.get('/store/lock-add'),
      ]);

      setTemplates(templatesRes.data.data || []);
      setExistingStores(storesRes.data.data || []);
      setLockAddStores(lockRes.data.data?.locked === 'y');
    } catch (err: any) {
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        display_name: formData.display_name,
        template_type: formData.template_type,
        template_id: formData.template_id,
        sample_data: formData.sample_data === 'yes',
      };

      await api.post('/store/create', payload);
      router.push('/store/overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create store');
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

  if (lockAddStores) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <h1>New Store Creation Wizard</h1>
          <div className="alert alert-danger">
            <strong>Note</strong> Store creation is disabled at this time.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>New Store Creation Wizard</h1>
          <p>
            <i className="fa fa-info-circle"></i> You are about to create a new storefront. The process is as simple as 1, 2, 3.
          </p>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <div className="alert alert-warning">
            <strong>Note</strong> Non-live stores hosted free for 180 days from creation date. After the 180 days billing of $49 per month will be added.
          </div>
        </div>
      </div>

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
                <h3 className="panel-title"><i className="fa fa-cogs"></i> New Store Creation Wizard</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>1. Select a name for your storefront *</label>
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
                  <label>1b. (Optional) Select a display name for your storefront</label>
                  <input
                    type="text"
                    className="form-control"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>2. Select the template you want your storefront to look like initially</label>
                </div>

                <div className="form-group">
                  {templates.map(template => (
                    <div key={template.id} className="radio">
                      <label>
                        <input
                          type="radio"
                          name="template_type"
                          value="default"
                          checked={formData.template_type === 'default'}
                          onChange={handleInputChange}
                        />
                        {' '}Start From the Default {template.description} Template
                      </label>
                    </div>
                  ))}

                  {existingStores.length > 0 && (
                    <div>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            name="template_type"
                            value="existing"
                            checked={formData.template_type === 'existing'}
                            onChange={handleInputChange}
                          />
                          {' '}Or, Start From an Existing Storefront
                        </label>
                      </div>
                      {formData.template_type === 'existing' && (
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                          <select
                            className="form-control"
                            name="template_id"
                            value={formData.template_id || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">-- select store --</option>
                            {existingStores.map(store => (
                              <option key={store.id} value={store.id}>
                                {store.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>3. Would you like this store to start with some sample information to provide examples? *</label>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="sample_data"
                        value="yes"
                        checked={formData.sample_data === 'yes'}
                        onChange={handleInputChange}
                      />
                      {' '}I would like the store to have sample data when created.
                    </label>
                  </div>
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        name="sample_data"
                        value="no"
                        checked={formData.sample_data === 'no'}
                        onChange={handleInputChange}
                      />
                      {' '}I do not want any data present when the store is created.
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <p className="help-block">
                    <span className="label label-warning">Note</span> Processing takes a few minutes. Please only click the Add Store button once.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding Store...' : 'Add Store'}
            </button>
            <a href="/store/overview" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
