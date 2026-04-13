'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface QAndA {
  id: string;
  product_name: string;
  question: string;
}

export default function ProductQandaSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<QAndA[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get('/products/qanda/search', {
        params: { q: searchQuery },
      });
      setResults(response.data.data || []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Search Q&A</h1>
        </div>
      </div>
      <br />

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Search Criteria</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Search</label>
                  <input
                    type="text"
                    className="form-control"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {searched && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Results ({results.length})</h3>
              </div>
              <div className="panel-body">
                {results.length === 0 ? (
                  <p className="text-muted">No Q&A found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Question</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.question}</td>
                          <td>
                            <Link href={`/products/qanda/edit/${item.id}`} className="btn btn-sm btn-default">
                              Edit
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
      )}
    </div>
  );
}
