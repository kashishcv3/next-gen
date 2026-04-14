'use client';

import React, { useState } from 'react';

export default function MarketingOptionsPage() {
  const [settings, setSettings] = useState({
    allow_marketing_import: true,
    allow_marketing_export: true,
    default_opt_in: true,
    send_confirmation: true,
    confirmation_email: '',
    from_email: '',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would save to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Marketing Settings</h1>

      {saved && <div className="alert alert-success">Settings saved successfully!</div>}

      <form onSubmit={handleSave}>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Email Marketing Settings</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="allow_marketing_import">
                <input
                  type="checkbox"
                  id="allow_marketing_import"
                  name="allow_marketing_import"
                  checked={settings.allow_marketing_import}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                Allow Customers to Import Email Lists
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="allow_marketing_export">
                <input
                  type="checkbox"
                  id="allow_marketing_export"
                  name="allow_marketing_export"
                  checked={settings.allow_marketing_export}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                Allow Customers to Export Email Lists
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="default_opt_in">
                <input
                  type="checkbox"
                  id="default_opt_in"
                  name="default_opt_in"
                  checked={settings.default_opt_in}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                Default Opt-In Status for New Contacts
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="send_confirmation">
                <input
                  type="checkbox"
                  id="send_confirmation"
                  name="send_confirmation"
                  checked={settings.send_confirmation}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                Send Confirmation Email on Subscribe
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="from_email">From Email Address</label>
              <input
                type="email"
                className="form-control"
                id="from_email"
                name="from_email"
                value={settings.from_email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmation_email">Confirmation Email Subject</label>
              <textarea
                className="form-control"
                id="confirmation_email"
                name="confirmation_email"
                value={settings.confirmation_email}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                <i className="fa fa-save"></i> Save Settings
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
