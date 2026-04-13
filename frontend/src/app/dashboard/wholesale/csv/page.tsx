'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Wholesale {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
}

export default function WholesaleCSVPage() {
  const [wholesales, setWholesales] = useState<Wholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWholesales();
  }, []);

  const fetchWholesales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wholesale');
      setWholesales(response.data.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load wholesale customers');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Company Name', 'Contact Name', 'Email', 'Phone', 'Status'];
    const rows = wholesales.map((w) => [
      w.id,
      w.company_name,
      w.contact_name,
      w.email,
      w.phone,
      w.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wholesale_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Export Wholesale to CSV</h1>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">CSV Export</h3>
        </div>
        <div className="panel-body">
          <p>Export {wholesales.length} wholesale customers to CSV format.</p>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <i className="fa fa-download"></i> Download CSV
          </button>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Preview</h3>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {wholesales.slice(0, 10).map((wholesale) => (
                <tr key={wholesale.id}>
                  <td>{wholesale.company_name}</td>
                  <td>{wholesale.contact_name}</td>
                  <td>{wholesale.email}</td>
                  <td>{wholesale.phone}</td>
                  <td>{wholesale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
