'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  price: string;
}

export default function ProductSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchType, setMatchType] = useState('name');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await api.get('/products/search', {
        params: {
          q: searchQuery,
          type: matchType,
        },
      });
      setResults(response.data.data || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['ID', 'Name', 'SKU', 'Price'];
    const rows = results.map(p => [p.id, p.name, p.sku, p.price]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => `"${val}"`).join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'product-search-results.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Search Products</h1>
          <p>
            <i className="fa fa-search"></i> Search for products by name, SKU, or alternate ID.
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

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Search Criteria</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Search Query</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter search term..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Match Type</label>
                  <div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="name"
                          checked={matchType === 'name'}
                          onChange={(e) => setMatchType(e.target.value)}
                        />
                        Product Name
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="sku"
                          checked={matchType === 'sku'}
                          onChange={(e) => setMatchType(e.target.value)}
                        />
                        SKU
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          value="alternate_id"
                          checked={matchType === 'alternate_id'}
                          onChange={(e) => setMatchType(e.target.value)}
                        />
                        Alternate ID
                      </label>
                    </div>
                  </div>
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
        <>
          <br />
          <div className="row">
            <div className="col-lg-12">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    Search Results ({results.length})
                  </h3>
                </div>
                <div className="panel-body">
                  {results.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={handleExportCSV}
                      style={{ marginBottom: '10px' }}
                    >
                      <i className="fa fa-download"></i> Export as CSV
                    </button>
                  )}

                  {results.length === 0 ? (
                    <p className="text-muted">No products found.</p>
                  ) : (
                    <table className="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>SKU</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(product => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>${parseFloat(product.price).toFixed(2)}</td>
                            <td>
                              <Link href={`/products/edit/${product.id}`} className="btn btn-sm btn-default">
                                Edit
                              </Link>
                              <Link href={`/products/copy/${product.id}`} className="btn btn-sm btn-info">
                                Copy
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
