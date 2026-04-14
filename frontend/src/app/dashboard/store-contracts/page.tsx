'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface Contract {
  id: number;
  site_id: number;
  contract_file: string;
  created_at: string | null;
}

export default function StoreContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contractsEnabled, setContractsEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/stores/contracts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContracts(response.data.contracts);
      } catch (err) {
        setError('Failed to load contracts data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('contract_file') as File;

    if (!file) {
      setUploadError('Please select a file');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('contract_file', file);

      await axios.post(`${API_BASE_URL}/stores/contracts/upload`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess('Contract uploaded successfully');
      e.currentTarget.reset();

      // Refresh contracts list
      const response = await axios.get(`${API_BASE_URL}/stores/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(response.data.contracts);
    } catch (err) {
      setUploadError('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Store Contracts</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row" style={{ marginBottom: '30px' }}>
        <div className="col-md-6">
          <h3>Contracts Settings</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={contractsEnabled}
                onChange={(e) => setContractsEnabled(e.target.checked)}
              />
              Enable Contracts
            </label>
          </div>
        </div>
      </div>

      {contractsEnabled && (
        <div className="row" style={{ marginBottom: '30px' }}>
          <div className="col-md-6">
            <h3>Upload New Contract</h3>
            {uploadError && <div className="alert alert-danger">{uploadError}</div>}
            {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}
            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label htmlFor="contract_file">PDF Contract File</label>
                <input
                  type="file"
                  id="contract_file"
                  name="contract_file"
                  className="form-control"
                  accept=".pdf"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Contract'}
              </button>
            </form>
          </div>
        </div>
      )}

      <h3>Contracts List</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Site ID</th>
              <th>Contract File</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No contracts found
                </td>
              </tr>
            ) : (
              contracts.map((contract) => (
                <tr key={contract.id}>
                  <td>{contract.id}</td>
                  <td>{contract.site_id}</td>
                  <td>{contract.contract_file}</td>
                  <td>{formatDate(contract.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
