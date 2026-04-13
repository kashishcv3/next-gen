'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface ProductInfo {
  id: string;
  name: string;
  sku: string;
}

export default function ProductIdFinderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    setResult(null);

    try {
      const response = await api.get('/products/find-by-id', {
        params: { query: searchQuery },
      });
      setResult(response.data.data || null);
      if (!response.data.data) {
        setError('Product not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Find Product by ID</h1>
          <p><i className="fa fa-search"></i> Lookup product information by ID or SKU.</p>
        </div>
      </div>
      <br />

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Search</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Product ID or SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter product ID or SKU..."
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {searched && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-12">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {result && (
              <div className="panel panel-success">
                <div className="panel-heading">
                  <h3 className="panel-title">Product Found</h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={result.id}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={result.name}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU</label>
                    <input
                      type="text"
                      className="form-control"
                      value={result.sku}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
