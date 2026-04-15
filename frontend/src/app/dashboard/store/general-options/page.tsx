'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * General Options page (option_type=core).
 * Replicates old platform's general_options.tpl (core section) exactly.
 * Three panels: Admin Options, Session Options, Information.
 */

// Session length options (matches $options.gc_maxlifetime in old platform)
const GC_MAXLIFETIME_OPTIONS: Record<string, string> = {
  '1440': '24 Minutes (Default)',
  '2880': '48 Minutes',
  '4320': '72 Minutes',
  '7200': '2 Hours',
  '14400': '4 Hours',
  '28800': '8 Hours',
  '43200': '12 Hours',
  '86400': '24 Hours',
};

export default function GeneralOptionsPage() {
  const { siteId } = useStore();

  const [info, setInfo] = useState<Record<string, any>>({});
  const [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (siteId) fetchOptions();
  }, [siteId]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-settings/general/${siteId}`);
      setInfo(res.data.info || {});
      setServiceId(res.data.service_id || '');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load general options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setInfo({ ...info, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await api.post(`/store-settings/general/${siteId}`, {
        display_name: info.display_name || '',
        admin_search_boxes: info.admin_search_boxes || 'n',
        admin_append_name: info.admin_append_name || 'n',
        batch_size: info.batch_size || '25',
        editor_type: info.editor_type || '1',
        template_css_enabled: info.template_css_enabled || 'n',
        gc_maxlifetime: info.gc_maxlifetime || '1440',
        create_session_link: info.create_session_link || 'n',
      });
      setSuccess('General options saved');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save general options');
    } finally {
      setSaving(false);
    }
  };

  // Reusable Yes/No radio group (matches {html_radios} with $options.yesno)
  const YesNoRadio = ({ name, value }: { name: string; value: string }) => (
    <>
      <label className="radio-inline">
        <input
          type="radio"
          name={name}
          value="y"
          checked={value === 'y'}
          onChange={() => handleChange(name, 'y')}
        />{' '}
        Yes
      </label>
      &nbsp;
      <label className="radio-inline">
        <input
          type="radio"
          name={name}
          value="n"
          checked={value !== 'y'}
          onChange={() => handleChange(name, 'n')}
        />{' '}
        No
      </label>
    </>
  );

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>General Options</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form name="general_options" onSubmit={handleSubmit} role="form">

        {/* Admin Options Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Admin Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    name="display_name"
                    className="form-control"
                    type="text"
                    value={info.display_name || ''}
                    onChange={(e) => handleChange('display_name', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Replace Multi-Select Boxes for Products and Categories With a Search</label>
                  <div>
                    <YesNoRadio name="admin_search_boxes" value={info.admin_search_boxes || 'n'} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Append Store Name to Export Files</label>
                  <div>
                    <YesNoRadio name="admin_append_name" value={info.admin_append_name || 'n'} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Order Download Batch Size</label>
                  <select
                    className="form-control"
                    name="batch_size"
                    value={info.batch_size || '25'}
                    onChange={(e) => handleChange('batch_size', e.target.value)}
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                    <option value="150">150</option>
                    <option value="all">all</option>
                  </select>
                  <p className="help-block">It is not recommended to download more than 100 orders at a time. This does not affect webservice downloads.</p>
                </div>
                <div className="form-group">
                  <label>Template Editor</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="editor_type"
                        value="1"
                        checked={info.editor_type !== '2'}
                        onChange={() => handleChange('editor_type', '1')}
                      />{' '}
                      Basic
                    </label>
                    &nbsp;
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="editor_type"
                        value="2"
                        checked={info.editor_type === '2'}
                        onChange={() => handleChange('editor_type', '2')}
                      />{' '}
                      Advanced
                    </label>
                  </div>
                  <p className="help-block">The Advanced Editor provides syntax highlighting and fullscreen editing.</p>
                </div>
                <div className="form-group">
                  <label>Enable CSS Editing for Templates</label>
                  <div>
                    <YesNoRadio name="template_css_enabled" value={info.template_css_enabled || 'n'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Options Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Session Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Session Length</label>
                  <select
                    className="form-control"
                    name="gc_maxlifetime"
                    value={info.gc_maxlifetime || '1440'}
                    onChange={(e) => handleChange('gc_maxlifetime', e.target.value)}
                  >
                    {Object.entries(GC_MAXLIFETIME_OPTIONS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Create Session Links in Checkout</label>
                  <div>
                    <YesNoRadio name="create_session_link" value={info.create_session_link || 'n'} />
                  </div>
                  <p className="help-block">
                    See the <a href="/HelpDesk#/CV3-Overview/181429-general-options-session-options#sessionlinks" target="_blank" rel="noreferrer">Session Link Documentation</a> for usage and examples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Web Service ID</label>
                  <div>{serviceId || '(none)'}</div>
                  <p className="help-block">
                    You can view information about the web service <a href="/HelpDesk#/20660-cv3-web-service" target="_blank" rel="noreferrer">here</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          type="submit"
          value={saving ? 'Saving...' : 'Submit'}
          name="submit"
          className="btn btn-primary"
          disabled={saving}
        />
      </form>
    </>
  );
}
