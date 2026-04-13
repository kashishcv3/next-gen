'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Filter {
  id: string;
  name: string;
  category_name: string;
}

export default function CategoryFilterPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/filters');
      setFilters(response.data.data || []);
    } catch (err) {
      setError('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Category Filters</h1>
          <p><i className="fa fa-filter"></i> Manage category filters.</p>
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Filters ({filters.length})</h3>
              </div>
              <div className="panel-body">
                {filters.length === 0 ? (
                  <p className="text-muted">No filters found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filters.map(filter => (
                        <tr key={filter.id}>
                          <td>{filter.name}</td>
                          <td>{filter.category_name}</td>
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
