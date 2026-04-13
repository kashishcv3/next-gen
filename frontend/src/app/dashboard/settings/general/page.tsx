'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface GeneralOptions {
  display_name: string;
  admin_search_boxes: boolean;
  admin_append_name: boolean;
  batch_size: string;
  editor_type: string;
  template_css_enabled: boolean;
  gc_maxlifetime: number;
  create_session_link: boolean;
  websvc_enabled: boolean;
  captcha_enabled: boolean;
  captcha_site_key: string;
  ip_whitelist_enabled: boolean;
  csrf_protection_enabled: boolean;
}

export default function SettingsGeneralPage() {
  const [options, setOptions] = useState<GeneralOptions>({
    display_name: '',
    admin_search_boxes: false,
    admin_append_name: false,
    batch_size: '100',
    editor_type: 'basic',
    template_css_enabled: false,
    gc_maxlifetime: 1800,
    create_session_link: false,
    websvc_enabled: false,
    captcha_enabled: false,
    captcha_site_key: '',
    ip_whitelist_enabled: false,
    csrf_protection_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/settings/general');
      setOptions(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/settings/general', options);
      alert('Settings saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>General Settings</h1>
          <p><i className="fa fa-info-circle"></i> Configure general store settings.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Admin Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Display Name</label>
                  <input type="text" className="form-control" name="display_name" value={options.display_name} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="admin_search_boxes" checked={options.admin_search_boxes} onChange={handleInputChange} />
                    Replace Multi-Select Boxes with Search
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="admin_append_name" checked={options.admin_append_name} onChange={handleInputChange} />
                    Append Store Name to Export Files
                  </label>
                </div>

                <div className="form-group">
                  <label>Order Download Batch Size</label>
                  <select className="form-control" name="batch_size" value={options.batch_size} onChange={handleInputChange}>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                    <option value="150">150</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Template Editor</label>
                  <select className="form-control" name="editor_type" value={options.editor_type} onChange={handleInputChange}>
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="template_css_enabled" checked={options.template_css_enabled} onChange={handleInputChange} />
                    Enable CSS Editing for Templates
                  </label>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Session Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Session Timeout (seconds)</label>
                  <input type="number" className="form-control" name="gc_maxlifetime" value={options.gc_maxlifetime} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="create_session_link" checked={options.create_session_link} onChange={handleInputChange} />
                    Create Session Links in Checkout
                  </label>
                </div>
              </div>
            </div>

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-lock"></i> Security Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    <input type="checkbox" name="captcha_enabled" checked={options.captcha_enabled} onChange={handleInputChange} />
                    Enable CAPTCHA
                  </label>
                </div>

                {options.captcha_enabled && (
                  <div className="form-group">
                    <label>CAPTCHA Site Key</label>
                    <input type="text" className="form-control" name="captcha_site_key" value={options.captcha_site_key} onChange={handleInputChange} />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="ip_whitelist_enabled" checked={options.ip_whitelist_enabled} onChange={handleInputChange} />
                    Enable IP Whitelist
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input type="checkbox" name="csrf_protection_enabled" checked={options.csrf_protection_enabled} onChange={handleInputChange} />
                    Enable CSRF Protection
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
