'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface GiftCert {
  id: number;
  code: string;
  pin: string;
  total_amount: string;
  remaining_amount: string;
  expiration: string;
  date_created: string;
  one_time_use: string;
  history: string;
  order_id: string;
}

export default function GiftCertificateTrackingPage() {
  const [results, setResults] = useState<GiftCert[]>([]);
  const [totals, setTotals] = useState({ total_amount: '0.00', remaining_amount: '0.00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search/filter
  const [search, setSearch] = useState('');
  const [display, setDisplay] = useState('all');
  const [sortBy, setSortBy] = useState('code');

  // Edit state
  const [editIds, setEditIds] = useState<Set<number>>(new Set());
  const [oneTimeIds, setOneTimeIds] = useState<Set<number>>(new Set());
  const [adjustType, setAdjustType] = useState('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [removeChecked, setRemoveChecked] = useState(false);

  // History popup
  const [historyPopup, setHistoryPopup] = useState<{ code: string; history: string } | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('display', display);
      params.append('sort_by', sortBy);
      const res = await api.get(`/orders/gc-report?${params.toString()}`);
      const data = res.data.data || [];
      setResults(data);
      setTotals(res.data.totals || { total_amount: '0.00', remaining_amount: '0.00' });
      // Initialize one_time_ids from data
      const otIds = new Set<number>();
      data.forEach((gc: GiftCert) => { if (gc.one_time_use === 'y') otIds.add(gc.id); });
      setOneTimeIds(otIds);
      setEditIds(new Set());
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [search, display, sortBy]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const toggleEditAll = (checked: boolean) => {
    if (checked) setEditIds(new Set(results.map(r => r.id)));
    else setEditIds(new Set());
  };

  const toggleEdit = (id: number) => {
    const next = new Set(editIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setEditIds(next);
  };

  const toggleOneTimeAll = (checked: boolean) => {
    if (checked) setOneTimeIds(new Set(results.map(r => r.id)));
    else setOneTimeIds(new Set());
  };

  const toggleOneTime = (id: number) => {
    const next = new Set(oneTimeIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setOneTimeIds(next);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editIds.size === 0) { setError('Please select at least one gift certificate to edit'); return; }
    setError(null); setSuccess(null);
    try {
      await api.post('/orders/gc-adjust', {
        edit: Array.from(editIds),
        adjust: adjustType,
        adjust_amount: adjustAmount,
        remove: removeChecked ? 'y' : 'n',
        one_time: Array.from(oneTimeIds),
      });
      setSuccess('Gift certificates adjusted successfully');
      setAdjustAmount('');
      setRemoveChecked(false);
      fetchReport();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to adjust gift certificates');
    }
  };

  const viewHistory = async (gcId: number) => {
    try {
      const res = await api.get(`/orders/gc-history/${gcId}`);
      const hist = res.data.history || '';
      const code = res.data.code || '';
      setHistoryPopup({ code, history: hist });
    } catch {
      setError('Failed to load history');
    }
  };

  const formatHistory = (hist: string) => {
    if (!hist) return 'No history available';
    return hist.split('|').filter(Boolean).map((entry, i) => {
      const parts = entry.split('\\t');
      return <div key={i}>{parts.join(' - ')}</div>;
    });
  };

  const formatDate = (d: string) => {
    if (!d || d === 'None') return '';
    try {
      const date = new Date(d);
      return `${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}/${date.getFullYear()}`;
    } catch { return d; }
  };

  const displayOptions: Record<string, string> = {
    'all': 'All',
    'active': 'Active',
    'expired': 'Expired',
    'unused': 'Unused',
    'used': 'Used',
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Gift Certificate Tracking</h1>
        <p><i className="fa fa-info-circle"></i> Use this report to track usage and issuance of gift certificates. Click the column header to sort the data.</p>
      </div></div>
      <br />
      <p>
        <a className="btn btn-primary btn-sm" href="/dashboard/products/gift-cards">Create Gift Certificates</a>
        {' '}
        <a className="btn btn-primary btn-sm" href="#" onClick={(e) => { e.preventDefault(); /* batch history placeholder */ }}>Gift Certificate Batch History</a>
      </p>
      <br />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Search form */}
      <form onSubmit={handleSearch}>
        <div className="row"><div className="col-lg-12">
          <div className="table-responsive">
            <table className="table cv3-data-table">
              <tbody>
                <tr>
                  <td className="text-center">
                    Search:<br />
                    <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </td>
                  <td className="text-center">
                    Display:<br />
                    <select className="form-control" value={display} onChange={(e) => setDisplay(e.target.value)}>
                      {Object.entries(displayOptions).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <br />
                    <button type="submit" className="btn btn-primary">Search</button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <span className="label label-warning">Note</span> Searchable terms include recipient&apos;s name, recipient&apos;s email address, order ID, and gift certificate number.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div></div>
      </form>

      {loading && <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>}

      {!loading && results.length > 0 && (
        <div className="row"><div className="col-lg-12">
          <form onSubmit={handleAdjustSubmit}>
            <div className="table-responsive well" style={{background:'none'}}>
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th><a href="#" onClick={(e) => { e.preventDefault(); setSortBy('code'); }}>Code</a></th>
                    <th className="text-center"><a href="#" onClick={(e) => { e.preventDefault(); setSortBy('total_amount'); }}><b>Total Amount</b></a></th>
                    <th className="text-center"><a href="#" onClick={(e) => { e.preventDefault(); setSortBy('remaining_amount'); }}><b>Remaining Amount</b></a></th>
                    <th className="text-center"><a href="#" onClick={(e) => { e.preventDefault(); setSortBy('expiration'); }}><b>Expiration</b></a></th>
                    <th className="text-center"><a href="#" onClick={(e) => { e.preventDefault(); setSortBy('date_created'); }}><b>Date Created</b></a></th>
                    <th className="text-center"><b>History</b></th>
                    <th className="text-center">
                      One-Time Use <input type="checkbox" onChange={(e) => toggleOneTimeAll(e.target.checked)} />
                    </th>
                    <th className="text-center">
                      Edit <input type="checkbox" checked={editIds.size === results.length} onChange={(e) => toggleEditAll(e.target.checked)} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((gc) => (
                    <tr key={gc.id}>
                      <td>{gc.code}{gc.pin ? ` PIN: ${gc.pin}` : ''}</td>
                      <td className="text-center">${gc.total_amount}</td>
                      <td className="text-center">${gc.remaining_amount}</td>
                      <td className="text-center">{gc.expiration ? formatDate(gc.expiration) : 'None'}</td>
                      <td className="text-center">{formatDate(gc.date_created)}</td>
                      <td className="text-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); viewHistory(gc.id); }}>View History</a>
                      </td>
                      <td className="text-center">
                        <input type="checkbox" checked={oneTimeIds.has(gc.id)} onChange={() => toggleOneTime(gc.id)} />
                      </td>
                      <td className="text-center">
                        <input type="checkbox" checked={editIds.has(gc.id)} onChange={() => toggleEdit(gc.id)} />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td><b>Totals:</b></td>
                    <td className="text-center">${totals.total_amount}</td>
                    <td className="text-center">${totals.remaining_amount}</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center">&nbsp;</td>
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br />
            <div className="row"><div className="col-lg-12">
              <div className="panel panel-primary">
                <div className="panel-heading"><h3 className="panel-title"><i className="fa fa-cogs"></i> Edit Selected Gift Certificates</h3></div>
                <div className="panel-body">
                  <table className="table-responsive">
                    <tbody>
                      <tr>
                        <td>
                          Adjust Gift Certificate Amount:
                          <select className="form-control form-control-inline" value={adjustType} onChange={(e) => setAdjustType(e.target.value)} style={{display:'inline-block', width:'auto', marginLeft:'5px', marginRight:'5px'}}>
                            <option value="add">Add</option>
                            <option value="subtract">Subtract</option>
                          </select>
                          $
                          <input type="text" className="form-control form-control-inline" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} style={{display:'inline-block', width:'100px', marginLeft:'5px'}} />
                        </td>
                      </tr>
                      <tr>
                        <td style={{paddingTop:'10px'}}>
                          Permanently Delete Gift Certificate(s)
                          <input type="checkbox" checked={removeChecked} onChange={(e) => setRemoveChecked(e.target.checked)} style={{marginLeft:'5px'}} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <br />
                </div>
              </div>
              <p>
                <button type="submit" className="btn btn-primary">Submit</button>
              </p>
            </div></div>
          </form>
          <br />
          <table className="table cv3-data-table">
            <thead><tr><th className="text-left">Export Report</th></tr></thead>
            <tbody>
              <tr>
                <td>
                  <p>To download this data in a CSV file, <a href="#" onClick={(e) => { e.preventDefault(); /* CSV export placeholder */ }}>click here</a></p>
                </td>
              </tr>
            </tbody>
          </table>
        </div></div>
      )}

      {!loading && results.length === 0 && (
        <div className="row"><div className="col-lg-12">
          <p className="text-center">There were no results for your search</p>
        </div></div>
      )}

      {/* History Popup */}
      {historyPopup && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}} onClick={() => setHistoryPopup(null)}>
          <div style={{background:'white', padding:'20px', borderRadius:'5px', maxWidth:'600px', maxHeight:'400px', overflow:'auto', minWidth:'400px'}} onClick={(e) => e.stopPropagation()}>
            <h4>Gift Certificate History - {historyPopup.code}</h4>
            <hr />
            <div>{formatHistory(historyPopup.history)}</div>
            <hr />
            <button className="btn btn-default" onClick={() => setHistoryPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
