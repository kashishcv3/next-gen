'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function StoreDNSPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState('1');

  useEffect(() => {
    fetchDNSRecords();
  }, [siteId]);

  const fetchDNSRecords = async () => {
    try {
      const res = await api.get(`/stores/dns/${siteId}`);
      setRecords(res.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load DNS records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>DNS Records</h1>
          <p><i className="fa fa-info-circle"></i> Manage store DNS records.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-server"></i> DNS Records</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Type</th><th>Name</th><th>Value</th><th>TTL</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? records.map(record => (
                      <tr key={record.id}>
                        <td><span className="label label-info">{record.record_type}</span></td>
                        <td>{record.name}</td>
                        <td><code>{record.value}</code></td>
                        <td>{record.ttl}</td>
                        <td>
                          <button className="btn btn-xs btn-danger"><i className="fa fa-trash"></i></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="text-center">No DNS records found</td></tr>
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
