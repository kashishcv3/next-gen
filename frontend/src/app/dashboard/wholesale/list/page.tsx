'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Wholesaler {
  ws_id: number;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
  billing_city: string;
  billing_state: string;
  status: string;
}

export default function WholesaleListPage() {
  const [list, setList] = useState<Wholesaler[]>([]);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [limitBy, setLimitBy] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (limitBy) params.limit_by = limitBy;
      if (search) params.search = search;
      const res = await api.get('/wholesale/list', { params });
      setList(res.data.data || []);
      if (res.data.options) setOptions(res.data.options);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load wholesalers');
    } finally {
      setLoading(false);
    }
  }, [limitBy, search]);

  useEffect(() => { fetchList(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const openView = (wsId: number) => {
    window.open(`/dashboard/wholesale/view/${wsId}`, 'popup', 'width=400,height=500,statusbar=no,toolbars=no,location=no,scrollbars=yes');
  };

  const handleDelete = async (wsId: number) => {
    if (!window.confirm('Are you sure you want to delete this wholesaler?')) return;
    try {
      await api.delete(`/wholesale/wholesaler/${wsId}`);
      fetchList();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete wholesaler');
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'new') return <span className="label label-warning">new</span>;
    if (status === 'active') return <span className="label label-success">active</span>;
    return <span className="label label-default">inactive</span>;
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Wholesalers</h1>
        <p><i className="fa fa-info-circle"></i> Use this page to search wholesalers. Click a column header to sort.</p>
      </div></div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="row"><div className="col-lg-12">
          <div className="table-responsive">
            <table className="table cv3-data-table">
              <tbody>
                <tr>
                  <td className="text-center">
                    Search by:<br />
                    <select className="form-control" value={limitBy} onChange={(e) => setLimitBy(e.target.value)}>
                      <option value="">-- All --</option>
                      {Object.entries(options).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    Search:<br />
                    <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </td>
                  <td className="text-center">
                    <br />
                    <button type="submit" className="btn btn-primary">Modify List</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div></div>
      </form>

      {loading && <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>}

      {!loading && (
        <div className="row"><div className="col-lg-12">
          <div className="well" style={{background:'none'}}>
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th className="text-left"><b>Company Name</b></th>
                    <th className="text-center"><b>Contact</b></th>
                    <th className="text-center"><b>Location</b></th>
                    <th className="text-center"><b>Status</b></th>
                    <th className="text-center"><b>Actions</b></th>
                  </tr>
                </thead>
                <tbody>
                  {list.length > 0 ? list.map((company, idx) => (
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
                      <td className="text-center">{getStatusLabel(company.status)}</td>
                      <td className="text-center">
                        <a href={`/dashboard/wholesale/order/history?ws_id=${company.ws_id}`} title="View Orders" style={{marginRight:'8px'}}>
                          <i className="fa fa-shopping-cart"></i>
                        </a>
                        <a href={`/dashboard/wholesale/edit/${company.ws_id}`} title="Edit" style={{marginRight:'8px'}}>
                          <i className="fa fa-pencil"></i>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(company.ws_id); }} title="Delete">
                          <i className="fa fa-times" style={{color:'red'}}></i>
                        </a>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center">There were no results for your search</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div></div>
      )}
    </div>
  );
}
