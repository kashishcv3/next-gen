'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface WsShipper {
  id: number;
  method: string;
  code: string;
}

export default function WholesaleShippingListPage() {
  const [shipping, setShipping] = useState<WsShipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wholesale/shipping');
      setShipping(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load wholesale shipping');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shipper?')) return;
    try {
      await api.delete(`/wholesale/shipping/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete shipper');
    }
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1>Wholesale Shipping Options</h1>
        <p><i className="fa fa-info-circle"></i> Use this page to manage the shipping options available to your wholesale customers.</p>
      </div></div>
      <br />

      <p>
        <a className="btn btn-primary btn-sm" href="/dashboard/wholesale/shipping/add">
          <i className="fa fa-plus"></i> Add Shipper
        </a>
      </p>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>}

      {!loading && (
        <div className="row"><div className="col-lg-12">
          <div className="well" style={{background:'none'}}>
            <div className="table-responsive">
              <table className="table table-hover table-striped cv3-data-table">
                <thead>
                  <tr>
                    <th className="text-left"><b>Shipper</b></th>
                    <th className="text-center"><b>Import Code</b></th>
                    <th className="text-center"><b>Delete</b></th>
                  </tr>
                </thead>
                <tbody>
                  {shipping.length > 0 ? shipping.map((shipper) => (
                    <tr key={shipper.id}>
                      <td>
                        <a href={`/dashboard/wholesale/shipping/edit/${shipper.id}`}>
                          {shipper.method}
                        </a>
                      </td>
                      <td className="text-center">{shipper.code}</td>
                      <td className="text-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(shipper.id); }}
                          title="Delete Shipper" data-toggle="tooltip">
                          <i className="fa fa-times" style={{color:'red'}}></i>
                        </a>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="text-center">No wholesale shippers found</td></tr>
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
