'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SearchResultRecord {
  search_term: string;
  results_found: number;
  click_through_rate: number;
  date_searched: string;
}

interface SearchResultsData {
  records: SearchResultRecord[];
}

export default function SearchResultsPage() {
  const [data, setData] = useState<SearchResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/search-results');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load search results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Search Results Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Analyze search performance and click-through rates.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading search results...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Search Term</th>
                      <th className="text-center">Results Found</th>
                      <th className="text-center">Click-Through Rate</th>
                      <th>Date Searched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.search_term}</td>
                        <td align="center">{record.results_found}</td>
                        <td align="center">{(record.click_through_rate * 100).toFixed(2)}%</td>
                        <td>{record.date_searched}</td>
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
