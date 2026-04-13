'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BenchmarkData {
  category: string;
  your_value: number;
  industry_average: number;
  percentile: number;
}

interface BenchmarkResult {
  records: BenchmarkData[];
}

export default function BenchmarkPage() {
  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/benchmark');
        setData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load benchmark data');
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
          <h1>Benchmark Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Compare your store performance against industry benchmarks.
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

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading benchmark data...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-center">Your Value</th>
                      <th className="text-center">Industry Average</th>
                      <th className="text-center">Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.category}</td>
                        <td align="center">{record.your_value}</td>
                        <td align="center">{record.industry_average}</td>
                        <td align="center">{record.percentile}%</td>
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
