'use client';

import React from 'react';
import Link from 'next/link';

export default function AccountResetFinishPage() {
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1></h1>
          <p>
            <b>
              <i className="fa fa-info-circle"></i> Your password has been changed
            </b>
          </p>
        </div>
      </div>
      <br />

      <p>
        <Link href="/dashboard" className="btn btn-primary btn-sm">
          Proceed to Dashboard
        </Link>
      </p>
    </div>
  );
}
