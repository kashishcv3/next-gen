'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PageComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Opt-Out List</h1>
          <p>
            <i className="fa fa-info-circle"></i> Opt-Out List management and operations.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Report Data</td>
                      <td align="center">Ready</td>
                    </tr>
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
