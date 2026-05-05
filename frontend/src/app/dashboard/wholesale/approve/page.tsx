'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface NewWholesaler {
  ws_id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  billing_city: string;
  billing_state: string;
}

export default function ApproveWholesalersPage() {
  const [newList, setNewList] = useState<NewWholesaler[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approveIds, setApproveIds] = useState<Set<number>>(new Set());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wholesale/approve');
      setNewList(res.data.data || []);
      setCount(res.data.count || 0);
      setApproveIds(new Set());
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load new wholesalers');
    } finally {
      setLoading(false);
    }
  };

  const toggleApprove = (wsId: number) => {
    const next = new Set(approveIds);
    if (next.has(wsId)) next.delete(wsId); else next.add(wsId);
    setApproveIds(next);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (approveIds.size === 0) {
      setError('Please select at least one wholesaler to approve');
      return;
    }
    setError(null); setSuccess(null);
    try {
      await api.post('/wholesale/approve', { ws_ids: Array.from(approveIds) });
      setSuccess(`${approveIds.size} wholesaler(s) approved successfully`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve wholesalers');
    }
  };

  const openView = (wsId: number) => {
    window.open(`/dashboard/wholesale/view/${wsId}`, 'popup', 'width=400,height=500,statusbar=no,toolbars=no,location=no,scrollbars=yes');
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>New Wholesaler Requests</h1>
      </div></div>
      <br />

      {error && (
        <div className="alert alert-danger alert-dismissible">
          <button type="button" className="close" onClick={() => setError(null)}>&times;</button>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible">
          <button type="button" className="close" onClick={() => setSuccess(null)}>&times;</button>
          {success}
        </div>
      )}

      <p>
        <i className="fa fa-info-circle"></i> Below you&apos;ll find all new wholesale customer requests.
        Check the box next to each company you&apos;d like to approve and then click &quot;Approve Wholesalers&quot;.
        Click a company name to view details. Click the edit icon to modify a wholesaler&apos;s information,
        or click the delete icon to remove the request.
      </p>
      <br />

      {loading && <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>}

      {!loading && (
        <form onSubmit={handleApprove}>
          <div className="row"><div className="col-lg-12">
            {count > 0 ? (
              <div className="well" style={{background:'none'}}>
                <div className="table-responsive">
                  <table className="table table-hover table-striped cv3-data-table">
                    <thead>
                      <tr>
                        <th className="text-left"><b>Company Name</b></th>
                        <th className="text-center"><b>Contact</b></th>
                        <th className="text-center"><b>Location</b></th>
                        <th className="text-center"><b>Approve</b></th>
                        <th className="text-center"><b>Actions</b></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newList.map((company) => (
                        <tr key={company.ws_id}>
                          <td>
                            <a href="#" onClick={(e) => { e.preventDefault(); openView(company.ws_id); }}>
                              {company.company_name}
                            </a>
                          </td>
                          <td className="text-center">
                            {company.contact_first_name} {company.contact_last_name}
                          </td>
                          <td className="text-center">
                            {company.billing_city}{company.billing_city && company.billing_state ? ', ' : ''}{company.billing_state}
                          </td>
                          <td className="text-center">
                            <input type="checkbox"
                              checked={approveIds.has(company.ws_id)}
                              onChange={() => toggleApprove(company.ws_id)}
                            />
                          </td>
                          <td className="text-center">
                            <a href={`/dashboard/wholesale/edit/${company.ws_id}`} title="Edit" style={{marginRight:'8px'}}>
                              <i className="fa fa-pencil"></i>
                            </a>
                            <a href="#" onClick={(e) => {
                              e.preventDefault();
                              if (window.confirm('Delete this wholesaler request?')) {
                                api.delete(`/wholesale/wholesaler/${company.ws_id}`).then(() => fetchData());
                              }
                            }} title="Delete">
                              <i className="fa fa-times" style={{color:'red'}}></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center">There were no results for your search</p>
            )}
          </div></div>

          {count > 0 && (
            <p>
              <button type="submit" className="btn btn-primary">Approve Wholesalers</button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
