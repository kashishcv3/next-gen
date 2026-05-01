'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface WholesaleMember {
  id: number;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string | null;
}

export default function ApproveWholesalersPage() {
  const [members, setMembers] = useState<WholesaleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/wholesale/approve');
      setMembers(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load pending wholesalers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id); setError(null);
    try {
      await api.post(`/wholesale/approve/${id}`);
      setSuccess('Wholesaler approved successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id); setError(null);
    try {
      await api.post(`/wholesale/reject/${id}`);
      setSuccess('Wholesaler rejected');
      setTimeout(() => setSuccess(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-check-circle" style={{ color: '#5cb85c' }}></i> Approve Wholesalers</h1>
          <p className="text-muted">Review and approve or reject wholesale customer applications.</p>
        </div>
      </div>

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div></div></div>}

      <div className="row" style={{ marginBottom: '15px' }}>
        <div className="col-lg-12">
          <span className="label label-warning" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <i className="fa fa-clock-o"></i> Pending Applications: {members.length}
          </span>
          <button className="btn btn-default btn-sm" onClick={fetchData} style={{ marginLeft: '10px' }}>
            <i className="fa fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <i className="fa fa-spinner fa-spin fa-2x"></i>
          <p style={{ marginTop: '10px' }}>Loading pending applications...</p>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading" style={{ background: '#f5f5f5', borderBottom: '2px solid #5cb85c' }}>
                <h3 className="panel-title">
                  <i className="fa fa-briefcase" style={{ color: '#5cb85c', marginRight: '8px' }}></i>
                  Pending Wholesale Applications
                </h3>
              </div>
              <div className="panel-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9' }}>
                        <th style={{ fontWeight: 600 }}>ID</th>
                        <th style={{ fontWeight: 600 }}>Company Name</th>
                        <th style={{ fontWeight: 600 }}>Contact Email</th>
                        <th style={{ fontWeight: 600 }}>Phone</th>
                        <th style={{ fontWeight: 600 }}>Status</th>
                        <th style={{ fontWeight: 600 }}>Applied</th>
                        <th style={{ fontWeight: 600, width: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.length > 0 ? members.map(member => (
                        <tr key={member.id}>
                          <td><span className="label label-default">{member.id}</span></td>
                          <td style={{ fontWeight: 600 }}>{member.company_name}</td>
                          <td><a href={`mailto:${member.contact_email}`}>{member.contact_email}</a></td>
                          <td>{member.contact_phone || '—'}</td>
                          <td>
                            <span className={`label label-${member.status === 'pending' ? 'warning' : member.status === 'new' ? 'info' : 'default'}`}>
                              {member.status}
                            </span>
                          </td>
                          <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'}</td>
                          <td>
                            <button className="btn btn-xs btn-success" style={{ marginRight: '4px' }}
                              onClick={() => handleApprove(member.id)}
                              disabled={actionLoading === member.id}>
                              <i className={`fa ${actionLoading === member.id ? 'fa-spinner fa-spin' : 'fa-check'}`}></i> Approve
                            </button>
                            <button className="btn btn-xs btn-danger"
                              onClick={() => handleReject(member.id)}
                              disabled={actionLoading === member.id}>
                              <i className="fa fa-times"></i> Reject
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="text-center" style={{ padding: '30px', color: '#999' }}>
                            <i className="fa fa-check-circle fa-2x" style={{ display: 'block', marginBottom: '10px', color: '#5cb85c' }}></i>
                            No pending wholesale applications. All caught up!
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
