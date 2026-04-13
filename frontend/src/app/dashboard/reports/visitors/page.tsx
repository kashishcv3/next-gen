'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface VisitorData {
  startdate: string;
  enddate: string;
  total_visits: number;
  output: string;
}

export default function VisitorsPage() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.get('/reports/visitors', {
        params: { startdate: startDate, enddate: endDate },
      });
      setData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load visitor data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Visit Graphs</h1>
          <p>
            <i className="fa fa-info-circle"></i> Use the following graphs to identify trends in your business.
          </p>
          <p>Please note that this report runs nightly and data from today may not be available until the following day.</p>
        </div>
      </div>
      <br />

      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table cv3-data-table report-search">
                  <thead>
                    <tr>
                      <th className="text-center" colSpan={3}>
                        <b>Search by Date Range (mm/dd/yyyy):</b>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        From: <br />
                        <input
                          type="text"
                          className="form-control form-control-inline"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </td>
                      <td>
                        To: <br />
                        <input
                          type="text"
                          className="form-control form-control-inline"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </td>
                      <td align="center">
                        <br />
                        <button type="submit" className="btn btn-primary">
                          Modify Graphs
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>

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
            <p>Loading visitor graphs...</p>
          </div>
        </div>
      )}

      {data && data.output === 'y' && (
        <div className="row">
          <div className="col-lg-12">
            <div align="center">
              <b>Visit Graphs for {data.startdate} to {data.enddate}</b>
              <br />
              Total Visits for date range: {data.total_visits}
              <br />
            </div>
            <br />
            <div className="well well-cv3-table">
              <div className="panel panel-default">
                <div className="panel-heading">Visits Per Day</div>
                <div className="panel-body text-center">
                  <p>[Chart Placeholder: Visits Per Day Graph]</p>
                </div>
              </div>
              <br />
              <div className="panel panel-default">
                <div className="panel-heading">Visits By Day of Week</div>
                <div className="panel-body text-center">
                  <p>[Chart Placeholder: Visits By Day of Week Graph]</p>
                </div>
              </div>
              <br />
              <div className="panel panel-default">
                <div className="panel-heading">Visits By Month</div>
                <div className="panel-body text-center">
                  <p>[Chart Placeholder: Visits By Month Graph]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
