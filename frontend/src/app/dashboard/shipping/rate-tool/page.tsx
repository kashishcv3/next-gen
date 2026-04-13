'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface ShippingQuote {
  carrier: string;
  service: string;
  cost: number;
  estimated_days: number;
}

export default function ShippingRateToolPage() {
  const [formData, setFormData] = useState({ weight: '', dimensions: '', zip_code: '' });
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/shipping/rate-quote', formData);
      setQuotes(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get quotes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Shipping Rate Tool</h1>
          <p><i className="fa fa-info-circle"></i> Get shipping rate quotes.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-6">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-search"></i> Get Quote</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label>Weight (lbs) *</label>
                  <input type="number" className="form-control" name="weight" value={formData.weight} onChange={handleInputChange} step="0.01" required />
                </div>

                <div className="form-group">
                  <label>Dimensions (L x W x H)</label>
                  <input type="text" className="form-control" name="dimensions" value={formData.dimensions} onChange={handleInputChange} placeholder="12 x 10 x 8" />
                </div>

                <div className="form-group">
                  <label>Destination ZIP Code *</label>
                  <input type="text" className="form-control" name="zip_code" value={formData.zip_code} onChange={handleInputChange} required />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Getting quotes...' : 'Get Quote'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {quotes.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-success">
              <div className="panel-heading">
                <h3 className="panel-title">Available Quotes</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr><th>Carrier</th><th>Service</th><th>Cost</th><th>Est. Days</th></tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote, idx) => (
                      <tr key={idx}>
                        <td>{quote.carrier}</td>
                        <td>{quote.service}</td>
                        <td>${quote.cost.toFixed(2)}</td>
                        <td>{quote.estimated_days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
