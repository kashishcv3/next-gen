'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface TaxRateResult {
  zip_code: string;
  combined_rate: number;
  state_rate: number;
  local_rate: number;
}

export default function TaxRateToolPage() {
  const [zipCode, setZipCode] = useState('');
  const [results, setResults] = useState<TaxRateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/tax/rate-lookup', { zip_code: zipCode });
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to lookup tax rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Rate Tool</h1>
          <p><i className="fa fa-info-circle"></i> Look up tax rates by ZIP code.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-6">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-search"></i> Tax Rate Lookup</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input type="text" className="form-control" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Looking up...' : 'Lookup Rate'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-success">
              <div className="panel-heading">
                <h3 className="panel-title">Tax Rates for {results.zip_code}</h3>
              </div>
              <div className="panel-body">
                <dl className="dl-horizontal">
                  <dt>Combined Rate:</dt>
                  <dd>{results.combined_rate.toFixed(4)}%</dd>

                  <dt>State Rate:</dt>
                  <dd>{results.state_rate.toFixed(4)}%</dd>

                  <dt>Local Rate:</dt>
                  <dd>{results.local_rate.toFixed(4)}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
