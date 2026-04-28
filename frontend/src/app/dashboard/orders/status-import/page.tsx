'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderStatusImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('tab');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const formData = new FormData();
      formData.append('cv3_list', file);
      formData.append('cv3_type', fileType);
      formData.append('cv3_email', email);
      const response = await api.post('/orders/import-status', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Order status import submitted successfully. You will receive an email confirmation.');
      setFile(null);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Failed to import. Please check the file format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Order Status Import</h1>
          <p>
            <i className="fa fa-info-circle"></i> Use this feature to update order tracking numbers and order status information using an import file. Please see the <a href="/dashboard/help" target="_blank">documentation</a> for more information.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form method="post" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Order Status Import</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label><b>Choose File:</b></label>
                  <span className="btn btn-default">
                    <input
                      name="cv3_list"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
                      }}
                    />
                  </span>
                </div>
                <div className="form-group">
                  <label><b>Type:</b></label>
                  <select name="cv3_type" className="form-control" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                    <option value="tab">Tab Delimited</option>
                    <option value="pipe">Pipe Delimited</option>
                    <option value="comma">Comma Delimited</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><b>Notification Email:</b></label>
                  <input
                    type="text"
                    name="cv3_email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="help-block">To ensure delivery of your status emails, please add <b>info@commercev3.com</b> to your address book.</p>
                </div>
              </div>
            </div>
            <input
              type="submit"
              name="submit"
              value={loading ? 'Submitting...' : 'Submit'}
              className="btn btn-primary"
              disabled={loading}
            />
          </div>
        </div>
      </form>
    </>
  );
}
