'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface SalesRankRecord {
  rank: number;
  sku: string;
  product_name: string;
  quantity: number;
  revenue: number;
}

interface SalesRankData {
  records: SalesRankRecord[];
}

export default function SalesrankPage() {
  const [data, setData] = useState<SalesRankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/salesrank');
        setData(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load sales ranking');
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
          <h1>Sales Ranking Report</h1>
          <p>
            <i className="fa fa-info-circle"></i> View your best selling products ranked by sales volume.
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
            <p>Loading report data...</p>
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
                      <th className="text-center">Rank</th>
                      <th className="text-center">SKU</th>
                      <th className="text-center">Product Name</th>
                      <th className="text-center">Quantity Sold</th>
                      <th className="text-center">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((record, idx) => (
                      <tr key={idx}>
                        <td align="center">{record.rank}</td>
                        <td align="center">{record.sku}</td>
                        <td align="center">{record.product_name}</td>
                        <td align="center">{record.quantity}</td>
                        <td align="center">${record.revenue.toFixed(2)}</td>
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
