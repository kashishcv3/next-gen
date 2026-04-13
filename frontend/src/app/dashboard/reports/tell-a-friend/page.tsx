'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReportRecord {
  [key: string]: any;
}

interface ReportData {
  records?: ReportRecord[];
  data?: any;
  [key: string]: any;
}

export default function TellAFriendPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/tell-a-friend');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load report');
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
          <h1>Tell a Friend Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> Tell a friend report
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading report data...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Column 1</th>
                      <th>Column 2</th>
                      <th>Column 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(data.records) && data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.field1 || 'N/A'}</td>
                        <td>{record.field2 || 'N/A'}</td>
                        <td>{record.field3 || 'N/A'}</td>
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
