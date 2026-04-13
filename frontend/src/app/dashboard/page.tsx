'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Panel from '@/components/ui/Panel';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Panel type="primary" heading="Welcome to CV3 Admin Platform">
            <p>
              Welcome, <strong>{user?.name}</strong>!
            </p>
            <p>
              This is your administrative dashboard. Use the sidebar navigation to access various sections
              of the platform.
            </p>
          </Panel>
        </div>
      </div>

      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-md-4">
          <Panel type="default" heading="Quick Stats">
            <ul className="list-unstyled">
              <li>
                <strong>Total Orders:</strong> <span className="badge">42</span>
              </li>
              <li style={{ marginTop: '10px' }}>
                <strong>Total Customers:</strong> <span className="badge">156</span>
              </li>
              <li style={{ marginTop: '10px' }}>
                <strong>Active Products:</strong> <span className="badge">89</span>
              </li>
            </ul>
          </Panel>
        </div>

        <div className="col-md-4">
          <Panel type="success" heading="System Status">
            <ul className="list-unstyled">
              <li>
                <i className="fa fa-check" style={{ color: 'green' }}></i> API: Running
              </li>
              <li style={{ marginTop: '10px' }}>
                <i className="fa fa-check" style={{ color: 'green' }}></i> Database: Connected
              </li>
              <li style={{ marginTop: '10px' }}>
                <i className="fa fa-check" style={{ color: 'green' }}></i> Services: Operational
              </li>
            </ul>
          </Panel>
        </div>

        <div className="col-md-4">
          <Panel type="info" heading="Recent Activity">
            <ul className="list-unstyled">
              <li>Order #1234 placed</li>
              <li style={{ marginTop: '10px' }}>New customer registered</li>
              <li style={{ marginTop: '10px' }}>Product inventory updated</li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
