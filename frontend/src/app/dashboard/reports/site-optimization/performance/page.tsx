'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
export default function SitePerformancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try { const res = await api.get('/reports/site-optimization/performance'); setData(res.data.data || res.data || []); }
      catch (err: any) { setError(err.response?.data?.detail || 'Failed to load data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);
  if (loading) return <div className="container-fluid" style={{padding:'20px'}}><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></div>;
  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12"><h1>Site Performance</h1><p><i className="fa fa-tachometer"></i> Monitor website performance metrics and optimization indicators</p></div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      <div className="row"><div className="col-lg-12"><div className="well well-cv3-table"><div className="table-responsive">
        <table className="table table-hover table-striped cv3-data-table">
          <thead><tr><th>Name</th><th>Value</th><th>Date</th></tr></thead>
          <tbody>
            {Array.isArray(data) && data.length === 0 ? (<tr><td colSpan={3} className="text-center">No data found</td></tr>) :
             Array.isArray(data) ? data.map((item: any, idx: number) => (<tr key={idx}><td>{item.name||item.title||'N/A'}</td><td>{item.value||item.count||'—'}</td><td>{item.date||'—'}</td></tr>)) :
             (<tr><td colSpan={3} className="text-center">Data loaded</td></tr>)}
          </tbody>
        </table>
      </div></div></div></div>
    </div>
  );
}
