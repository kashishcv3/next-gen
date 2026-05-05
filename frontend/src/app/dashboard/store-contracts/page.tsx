'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Contract {
  id: number;
  name: string;
  date_uploaded: string;
  active: string;
}

interface Activity {
  contract_id: number;
  name: string;
  username: string;
  agreed_to: string;
  disagreements: number;
  last_activity: string;
}

export default function StoreContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contractsEnabled, setContractsEnabled] = useState('n');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/contracts');
      setContracts(res.data.contracts || []);
      setActivities(res.data.activities || []);
      setContractsEnabled(res.data.contracts_enabled || 'n');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    if (!file || !file.name) {
      setError('Please select a PDF file to upload');
      return;
    }

    try {
      await api.post('/stores/contracts/upload', {
        filename: file.name,
        enable_contracts: contractsEnabled,
      });
      setSuccess('Contract uploaded successfully');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload contract');
    }
  };

  const getDisplayName = (name: string) => {
    const parts = name.split('|||');
    return parts.length > 1 ? parts[1] : name;
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Contracts</h1>
          <p>
            <i className="fa fa-info-circle"></i> Use this feature to upload new contractual agreements for stores which will be displayed when a user will try to log in to their stores.
          </p>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      {/* Panel 1: Upload New Contract */}
      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleUpload} encType="multipart/form-data">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-toggle-down"></i> Upload New Contract</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enable Store Contracts</label>
                  <div>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="enable_contracts"
                        value="y"
                        checked={contractsEnabled === 'y'}
                        onChange={(e) => setContractsEnabled(e.target.value)}
                      /> Yes
                    </label>
                    <label className="radio-inline">
                      <input
                        type="radio"
                        name="enable_contracts"
                        value="n"
                        checked={contractsEnabled === 'n'}
                        onChange={(e) => setContractsEnabled(e.target.value)}
                      /> No
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Upload PDF</label>
                  <input className="form-control" name="file" type="file" accept="application/pdf" />
                  <p className="help-block">Please remove special characters (such as &apos;%&apos;,&apos;@&apos;,&apos;&amp;&apos;) and spaces from the file names before uploading.</p>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fa fa-upload"></i> Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Panel 2: Store Contract Details */}
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-toggle-down"></i> Store Contract Details</h3>
            </div>
            <div className="panel-body">
              <table className="table table-striped table-bordered" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Contract ID</th>
                    <th>Contract</th>
                    <th>Date Uploaded</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr><td colSpan={4} className="text-center">No contracts found</td></tr>
                  ) : (
                    contracts.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>
                          <a href={`/store-contracts/${c.name}`} target="_blank" rel="noopener noreferrer">
                            {getDisplayName(c.name)}
                          </a>
                        </td>
                        <td>{c.date_uploaded}</td>
                        <td>{c.active === 'y' ? 'YES' : 'NO'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 3: User Contract Activities */}
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-toggle-down"></i> User Contract Activities</h3>
            </div>
            <div className="panel-body">
              <table className="table table-striped table-bordered" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Contract ID</th>
                    <th>Store Name</th>
                    <th>Username</th>
                    <th>Agreed</th>
                    <th>Disagreements</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr><td colSpan={6} className="text-center">No activities found</td></tr>
                  ) : (
                    activities.map((a, idx) => (
                      <tr key={idx}>
                        <td>{a.contract_id}</td>
                        <td>{a.name}</td>
                        <td>{a.username}</td>
                        <td>{a.agreed_to}</td>
                        <td>{a.disagreements}</td>
                        <td>{a.last_activity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
