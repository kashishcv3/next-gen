'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function URIRedirectsPage() {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState('1');

  useEffect(() => {
    fetchRedirects();
  }, [siteId]);

  const fetchRedirects = async () => {
    try {
      const res = await api.get(`/stores/uri-redirects/${siteId}`);
      setRedirects(res.data.redirects || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load URI redirects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (redirectId: string) => {
    if (!window.confirm('Delete this redirect?')) return;
    try {
      setRedirects(redirects.filter(r => r.id !== redirectId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete redirect');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>URI Redirects</h1>
          <p><i className="fa fa-info-circle"></i> Manage URL redirects for SEO and site structure.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <button className="btn btn-primary"><i className="fa fa-plus"></i> Add Redirect</button>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-arrows"></i> URI Redirects</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Source URI</th><th>Destination</th><th>Type</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {redirects.length > 0 ? redirects.map(redirect => (
                      <tr key={redirect.id}>
                        <td><code>{redirect.source_uri}</code></td>
                        <td><code>{redirect.destination_uri}</code></td>
                        <td><span className="label label-default">{redirect.redirect_type}</span></td>
                        <td>
                          <button className="btn btn-xs btn-info"><i className="fa fa-edit"></i></button>
                          <button className="btn btn-xs btn-danger" onClick={() => handleDelete(redirect.id)}><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center">No redirects configured</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
