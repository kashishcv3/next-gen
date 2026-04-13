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

export default function WholesalePrintPage() {
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div style={{ '@media print': { display: 'none' } }}>
        <button className="btn btn-primary" onClick={handlePrint}>
          <i className="fa fa-print"></i> Print
        </button>
      </div>

      <h1 style={{ marginTop: '20px' }}>Wholesale Customer Report</h1>
      <p>Generated: {new Date().toLocaleDateString()}</p>

      <table className="table table-bordered" style={{ marginTop: '20px' }}>
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
          {wholesales.map((wholesale) => (
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
  );
}
