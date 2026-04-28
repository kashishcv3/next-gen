'use client';

import React from 'react';
import Link from 'next/link';

export default function InfoPage() {
  const title = 'Fees';
  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Fees</h1>

      <div className="panel panel-default">
        <div className="panel-heading"><h3 className="panel-title">Information</h3></div>
        <div className="panel-body">
          <p>Welcome to Fees.</p>
          <p>This page provides access to {title.toLowerCase()} features and settings.</p>

          <div className="well" style={{ marginTop: '20px'}}>
            <h4>Available Actions:</h4>
            <ul>
              <li>View current {title.toLowerCase()} data</li>
              <li>Configure settings</li>
              <li>Access help and documentation</li>
            </ul>
          </div>

          <Link href="/" className="btn btn-default">
            <i className="fa fa-arrow-left"></i> Back
          </Link>
        </div>
      </div>
    </div>
  );
}
