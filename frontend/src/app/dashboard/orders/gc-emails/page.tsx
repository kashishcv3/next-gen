'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PendingEmail {
  order_id: string;
  date_ordered: string;
}

export default function OrderGCEmailsPage() {
  const [emails, setEmails] = useState<PendingEmail[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchEmails(); }, []);

  const fetchEmails = async () => {
    try {
      const res = await api.get('/orders/gc-emails');
      setEmails(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load pending emails');
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(emails.map(e => e.order_id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleOne = (orderId: string) => {
    const next = new Set(selected);
    if (next.has(orderId)) next.delete(orderId);
    else next.add(orderId);
    setSelected(next);
  };

  const handleAction = async (action: 'send' | 'delete') => {
    if (selected.size === 0) {
      setError('Please select at least one order');
      return;
    }
    setError(null); setSuccess(null);
    try {
      const endpoint = action === 'send' ? '/orders/gc-emails/send' : '/orders/gc-emails/delete';
      await api.post(endpoint, { order_ids: Array.from(selected) });
      setSuccess(action === 'send' ? 'Gift certificate emails sent successfully' : 'Gift certificate emails deleted successfully');
      setSelected(new Set());
      fetchEmails();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${action} emails`);
    }
  };

  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Pending Gift Certificate Emails</h1>
        <p><i className="fa fa-info-circle"></i> List and send pending gift certificate code emails.</p>
      </div></div>
      <br />
      <p>
        <a className="btn btn-primary btn-sm" href="/dashboard/orders/pending">Pending Orders</a>
      </p>
      <br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {emails.length === 0 ? (
        <p className="text-center">There are no gift certificate emails waiting to be sent</p>
      ) : (
        <>
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th className="text-left"><b>Order ID</b></th>
                    <th className="text-center"><b>Date Ordered</b></th>
                    <th className="text-center">
                      Select&nbsp;
                      <input type="checkbox" checked={selected.size === emails.length && emails.length > 0} onChange={(e) => toggleAll(e.target.checked)} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr key={email.order_id}>
                      <td>
                        <a href={`/dashboard/orders/detail/${email.order_id}`}>{email.order_id}</a>
                      </td>
                      <td className="text-center">{email.date_ordered}</td>
                      <td className="text-center">
                        <input type="checkbox" checked={selected.has(email.order_id)} onChange={() => toggleOne(email.order_id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-center">
            <button type="button" className="btn btn-primary" onClick={() => handleAction('delete')} style={{marginRight:'10px'}}>Delete Emails</button>
            <button type="button" className="btn btn-primary" onClick={() => handleAction('send')}>Send Emails</button>
          </p>
        </>
      )}
    </div>
  );
}
