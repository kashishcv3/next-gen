'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BenchmarkRow {
  report: string;
  prepend?: string;
  average: string;
  append?: string;
  store: string;
  better: number;
}

interface BenchmarkResult {
  data: BenchmarkRow[];
}

const timePeriodOptions: Record<string, string> = {
  'month_to_date': 'Month to Date',
  'year_to_date': 'Year to Date',
  'last_month': 'Last Month',
  'last_year': 'Last Year',
  'this_month_last_year': 'This Month Last Year',
};

export default function BenchmarkReportPage() {
  const [result, setResult] = useState<BenchmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('month_to_date');

  useEffect(() => {
    fetchBenchmarkData();
  }, [timePeriod]);

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/reports/benchmark?time_period=${timePeriod}`);
      setResult(response.data.result || []);
    } catch (err) {
      console.error('Failed to fetch benchmark report:', err);
      setError('Failed to load benchmark report');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBenchmarkData();
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Benchmark Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Use this report to find out how your store compares to other stores using CommerceV3.
          </p>
          <p>
            <span className="label label-warning">Note</span> Please note that this report runs nightly and data from today may not be available until the following day.
          </p>
        </div>
      </div>
      <br />

      <form onSubmit={handleSubmit}>
        <div>
          Time Period:
          {' '}
          <select
            name="time_period"
            className="form-control form-control-inline"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            {Object.entries(timePeriodOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {' '}
          <input type="submit" value="Submit" className="btn btn-primary" />
          <br />
          <br />
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading benchmark report...</div>}

      {!loading && result.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th className="text-center">CV3 Average</th>
                      <th className="text-center">Your Store</th>
                      <th className="text-center">
                        Percentile
                        <br />
                        (100% is top of your class)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((row, index) => {
                      // Skip Sales Trend and Visitor Trend
                      if (row.report === 'Sales Trend' || row.report === 'Visitor Trend') {
                        return null;
                      }
                      return (
                        <tr key={index}>
                          <td>{row.report}</td>
                          <td style={{ textAlign: 'center' }}>
                            {row.prepend}
                            {row.average}
                            {row.append}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {row.prepend}
                            {row.store}
                            {row.append}
                          </td>
                          <td style={{ textAlign: 'center' }}>{row.better}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && result.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          To download this data in a CSV file,{' '}
          <a href={`/api/reports/download?type=bnc&time_period=${timePeriod}`}>click here</a>
        </div>
      )}
    </div>
  );
}
