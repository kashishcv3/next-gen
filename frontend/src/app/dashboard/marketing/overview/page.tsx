'use client';

import React from 'react';
import Link from 'next/link';

export default function MarketingOverviewPage() {
  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Marketing & Campaigns</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Marketing Tools</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/campaigns/list" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-envelope" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Email Campaigns
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Create and manage email campaigns</p>
            </div>

            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/promos/list" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-tag" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Promotions
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Manage promotional campaigns</p>
            </div>

            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/meta/list" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-code" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Meta Tags
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>SEO meta tag management</p>
            </div>

            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/metagateway/list" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-sitemap" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Meta Gateways
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Configure gateway pages</p>
            </div>

            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/marketing/email-list" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-list" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Email List
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Manage email contacts</p>
            </div>

            <div className="col-md-4" style={{ marginBottom: '20px' }}>
              <Link href="/dashboard/marketing/options" className="btn btn-block btn-lg btn-default">
                <i className="fa fa-cog" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <br />
                Settings
              </Link>
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Marketing settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
