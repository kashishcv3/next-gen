'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Contract {
  id: string;
  name: string;
  type: string;
  status: string;
  effective_date: string;
  expiration_date?: string;
}

export default function StoreContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await api.get('/store/contracts');
      setContracts(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Contracts</h1>
          <p>
            <i className="fa fa-info-circle"></i> View and manage store contracts.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-file-contract"></i> Contracts List
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Effective Date</th>
                      <th>Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.length > 0 ? (
                      contracts.map(contract => (
                        <tr key={contract.id}>
                          <td>{contract.name}</td>
                          <td><span className="label label-info">{contract.type}</span></td>
                          <td><span className={`label label-${contract.status === 'active' ? 'success' : 'default'}`}>{contract.status}</span></td>
                          <td>{new Date(contract.effective_date).toLocaleDateString()}</td>
                          <td>{contract.expiration_date ? new Date(contract.expiration_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center">No contracts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
