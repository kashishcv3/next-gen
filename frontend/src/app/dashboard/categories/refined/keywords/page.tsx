'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Keyword {
  id: string;
  keyword: string;
  refined_category_name: string;
}

export default function CategoryRefinedKeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedRefined, setSelectedRefined] = useState('');

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/refined/keywords');
      setKeywords(response.data.data || []);
    } catch (err) {
      setError('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword || !selectedRefined) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await api.post('/categories/refined/keywords', {
        keyword: newKeyword,
        refined_category_id: selectedRefined,
      });
      setKeywords([...keywords, response.data.data]);
      setNewKeyword('');
      setSelectedRefined('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add keyword');
    }
  };

  const handleDelete = async (keywordId: string) => {
    try {
      await api.delete(`/categories/refined/keywords/${keywordId}`);
      setKeywords(keywords.filter(k => k.id !== keywordId));
    } catch (err) {
      setError('Failed to delete keyword');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Refined Category Keywords</h1>
          <p><i className="fa fa-tags"></i> Manage keywords for refined categories.</p>
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

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">Add Keyword</h3>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Keyword</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Refined Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedRefined}
                      onChange={(e) => setSelectedRefined(e.target.value)}
                      placeholder="Category ID"
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleAddKeyword}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Keywords ({keywords.length})</h3>
              </div>
              <div className="panel-body">
                {keywords.length === 0 ? (
                  <p className="text-muted">No keywords found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Keyword</th>
                        <th>Refined Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywords.map(keyword => (
                        <tr key={keyword.id}>
                          <td>{keyword.keyword}</td>
                          <td>{keyword.refined_category_name}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(keyword.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
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
