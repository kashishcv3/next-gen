'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CustomerGroup {
  id: number;
  name: string;
  description: string;
  created_at: string | null;
}

export default function CustomerGroupsDataPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/accounts/customer-groups');
      setGroups(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load customer groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-users" style={{ color: '#337ab7' }}></i> Customer Groups</h1>
          <p className="text-muted">View and manage customer group data and classifications.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <span className="label label-info" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-users"></i> Total Groups: {groups.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading customer groups...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #337ab7' }}>
                <h3 className="panel-title">
                  <i className="fa fa-database" style={{ color: '#337ab7', marginRight: '8px' }}></i>
                  Customer Groups
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        <th style={{ fontWeight: 600 }}>ID</th>
                        <th style={{ fontWeight: 600 }}>Group Name</th>
                        <th style={{ fontWeight: 600 }}>Description</th>
                        <th style={{ fontWeight: 600 }}>Created</th>
                        <th style={{ fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.length > 0 ? groups.map(group => (
                        <tr key={group.id}>
                          <td><span className="label label-default">{group.id}</span></td>
                          <td style={{ fontWeight: 600 }}>{group.name}</td>
                          <td>{group.description || '—'}</td>
                          <td>{group.created_at ? new Date(group.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <a href={`/dashboard/customer-groups/edit/${group.id}`} className="btn btn-xs btn-info" style={{ marginRight: '4px' }}>
                              <i className="fa fa-pencil"></i> Edit
                            </a>
                            <a href={`/dashboard/customer-groups/customer-list/${group.id}`} className="btn btn-xs btn-default">
                              <i className="fa fa-users"></i> Members
                            </a>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-inbox fa-2x" style={{ display: 'block', marginBottom: '10px' }}></i>
                            No customer groups found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
