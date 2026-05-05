'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ShipWorksOptionsPage() {
  const [form, setForm] = useState({
    shipworks_enable: 'n',
    shipworks_statuscodes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/shipping/options/shipworks');
      const data = res.data.data || res.data || {};

      let statuscodes = '';
      if (data.shipworks_statuscodes) {
        try {
          const parsed = JSON.parse(data.shipworks_statuscodes);
          statuscodes = Object.entries(parsed)
            .map(([code, name]) => `${code}:${name}`)
            .join('\n');
        } catch {
          statuscodes = data.shipworks_statuscodes || '';
        }
      }

      setForm({
        shipworks_enable: data.shipworks_enable || 'n',
        shipworks_statuscodes: statuscodes,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      let statuscodesJson = '';
      if (form.shipworks_statuscodes.trim()) {
        const lines = form.shipworks_statuscodes.split('\n').filter(l => l.trim());
        const parsed: Record<string, string> = {};
        for (const line of lines) {
          const [code, name] = line.split(':');
          if (code && name) {
            parsed[code.trim()] = name.trim();
          }
        }
        statuscodesJson = JSON.stringify(parsed);
      }

      const submitForm = {
        ...form,
        shipworks_statuscodes: statuscodesJson,
      };

      await api.post('/shipping/options/shipworks', submitForm);
      setSuccess('ShipWorks options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>ShipWorks Options</h1>
          <p><i className="fa fa-ship"></i> Configure ShipWorks integration settings</p>
        </div>
      </div>

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
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enable ShipWorks</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="shipworks_enable"
                        value="y"
                        checked={form.shipworks_enable === 'y'}
                        onChange={() => setForm({ ...form, shipworks_enable: 'y' })}
                      />
                      Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="shipworks_enable"
                        value="n"
                        checked={form.shipworks_enable === 'n'}
                        onChange={() => setForm({ ...form, shipworks_enable: 'n' })}
                      />
                      No
                    </label>
                  </div>
                  <p className="help-block">
                    Before enabling ShipWorks, ensure you have set up your store in ShipWorks and configured subuser credentials with proper permissions.
                  </p>
                </div>

                <div className="form-group">
                  <label>ShipWorks Status Codes</label>
                  <textarea
                    className="form-control"
                    value={form.shipworks_statuscodes}
                    onChange={(e) => setForm({ ...form, shipworks_statuscodes: e.target.value })}
                    style={{ width: '500px', height: '200px' }}
                  />
                  <p className="help-block">
                    <span className="label label-warning">Note</span> Enter the status code, a colon, and display name on each line (e.g., p:pending, s:shipped)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-save"></i> Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
