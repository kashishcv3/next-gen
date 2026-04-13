'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface SearchResult {
  file: string;
  line_number: number;
  content: string;
}

export default function StoreGrepPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/store/grep', { search_term: searchTerm });
      setResults(res.data.data || []);
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
          <h1>Store Grep Search</h1>
          <p><i className="fa fa-info-circle"></i> Search store configuration files.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-8">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-search"></i> Search</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label>Search Term *</label>
                  <input type="text" className="form-control" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Search Results ({results.length})</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>File</th><th>Line</th><th>Content</th></tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx}>
                        <td><code>{result.file}</code></td>
                        <td>{result.line_number}</td>
                        <td><code>{result.content}</code></td>
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
