'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SearchTermRecord {
  search_term: string;
  frequency: number;
  unique_searches: number;
  conversion_rate: number;
}

interface SearchTermsData {
  records: SearchTermRecord[];
}

export default function SearchTermsPage() {
  const [data, setData] = useState<SearchTermsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/search-terms');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load search terms');
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
          <h1>Search Terms Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> View the most common search terms used on your site.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading search terms...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Search Term</th>
                      <th className="text-center">Frequency</th>
                      <th className="text-center">Unique Searches</th>
                      <th className="text-center">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.search_term}</td>
                        <td align="center">{record.frequency}</td>
                        <td align="center">{record.unique_searches}</td>
                        <td align="center">{(record.conversion_rate * 100).toFixed(2)}%</td>
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
