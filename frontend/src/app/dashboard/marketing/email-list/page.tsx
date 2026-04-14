'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Contact {
  email: string;
  first_name?: string;
  last_name?: string;
  opt_in: number;
}

interface Response {
  total: number;
  page: number;
  page_size: number;
  items: Contact[];
}

export default function EmailListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [newContact, setNewContact] = useState({
    email: '',
    first_name: '',
    last_name: '',
  });
  const pageSize = 20;

  useEffect(() => {
    fetchContacts();
  }, [page, search]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (search) params.append('search', search);

      const response = await api.get(`/marketing/marketing-list?${params}`);
      setContacts(response.data.items || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/marketing/marketing-list', {
        ...newContact,
        opt_in: 1,
      });
      setNewContact({ email: '', first_name: '', last_name: '' });
      fetchContacts();
    } catch (err) {
      console.error('Failed to add contact:', err);
      setError('Failed to add contact');
    }
  };

  const handleDelete = async (email: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/marketing/marketing-list/${email}`);
        fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact:', err);
        setError('Failed to delete contact');
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Email Marketing List</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Add Contact Form */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Add Email Address</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={handleAddContact}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-plus"></i> Add Contact
            </button>
          </form>
        </div>
      </div>

      {/* Search */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Contact List */}
      {loading && <div className="alert alert-info">Loading contacts...</div>}

      {!loading && contacts.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Contacts ({total})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Opt In</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.email}>
                    <td>{contact.email}</td>
                    <td>{contact.first_name || '-'}</td>
                    <td>{contact.last_name || '-'}</td>
                    <td>
                      <span className={`label label-${contact.opt_in ? 'success' : 'danger'}`}>
                        {contact.opt_in ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(contact.email)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav style={{ marginTop: '20px', textAlign: 'center' }}>
              <ul className="pagination">
                <li className={page === 1 ? 'disabled' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}>
                    Previous
                  </a>
                </li>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => page - 2 + i).filter(p => p > 0 && p <= totalPages).map((p) => (
                  <li key={p} className={p === page ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setPage(p); }}>{p}</a>
                  </li>
                ))}
                <li className={page === totalPages ? 'disabled' : ''}>
                  <a href="#" onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}>
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {!loading && contacts.length === 0 && !error && (
        <div className="alert alert-info">No contacts found.</div>
      )}
    </div>
  );
}
