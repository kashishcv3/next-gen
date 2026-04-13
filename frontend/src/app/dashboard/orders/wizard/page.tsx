'use client';

import React, { useState } from 'react';

export default function OrderWizardPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Download/Print Wizard</h1>
      <hr />

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Step {step}: Confirmation</h3>
        </div>
        <div className="panel-body">
          <div className="alert alert-success">
            <strong>Success!</strong> Your orders have been processed and are ready for download or printing.
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>What's Next?</h4>
            <ul>
              <li>Download your order files in your preferred format (PDF, CSV, Excel)</li>
              <li>Print directly from your browser or save for later</li>
              <li>Share with your fulfillment team</li>
              <li>Archive for your records</li>
            </ul>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary btn-lg">
              <i className="fa fa-download"></i> Download Now
            </button>
            <button className="btn btn-default btn-lg" style={{ marginLeft: '10px' }}>
              <i className="fa fa-print"></i> Print
            </button>
            <button className="btn btn-default btn-lg" style={{ marginLeft: '10px' }}>
              <i className="fa fa-times"></i> Finish
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: '30px' }}>
        <h4>Progress</h4>
        <div className="progress">
          <div className="progress-bar progress-bar-success" style={{ width: '100%' }}>
            <span>Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
