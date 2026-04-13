'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showSupport, setShowSupport] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determine active section from pathname
  const getActiveSection = () => {
    if (pathname.includes('/products') || pathname.includes('/categories') || pathname.includes('/templates') || pathname.includes('/images') || pathname.includes('/files') || pathname.includes('/recipes') || pathname.includes('/styles')) return 'content';
    if (pathname.includes('/orders') || pathname.includes('/customers') || pathname.includes('/shipping') || pathname.includes('/tax') || pathname.includes('/wholesale')) return 'orders';
    if (pathname.includes('/marketing') || pathname.includes('/campaigns') || pathname.includes('/meta') || pathname.includes('/promos')) return 'marketing';
    if (pathname.includes('/reports')) return 'analytics';
    return 'site';
  };

  const activeSection = getActiveSection();

  return (
    <>
      <nav className="navbar navbar-cv3" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link className="navbar-brand" href="/dashboard">
            <img src="/images/cv3_logo_white.png" alt="CV3" style={{ marginTop: '10px' }} />
          </Link>
        </div>
        <div id="mobile-menu">
          <i className="fa fa-bars fa-2x"></i>
        </div>

        <div className="collapse navbar-collapse navbar-ex1-collapse">
          <ul className="nav navbar-nav top-nav">
            <li className={activeSection === 'site' ? 'active' : ''}>
              <Link href="/dashboard"><i className="fa fa-cube"></i> Dashboard</Link>
            </li>
            <li className={activeSection === 'orders' ? 'active' : ''}>
              <Link href="/dashboard/orders/list"><i className="fa fa-tags"></i> Orders</Link>
            </li>
            <li className={activeSection === 'content' ? 'active' : ''}>
              <Link href="/dashboard/products/list"><i className="fa fa-th-large"></i> Content</Link>
            </li>
            <li className={activeSection === 'marketing' ? 'active' : ''}>
              <Link href="/dashboard/marketing/overview"><i className="fa fa-desktop"></i> Marketing</Link>
            </li>
            <li className={activeSection === 'analytics' ? 'active' : ''}>
              <Link href="/dashboard/reports/overview"><i className="fa fa-area-chart"></i> Analytics</Link>
            </li>
            {user ? (
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <i className="fa fa-sign-out"></i> Logout
                </a>
              </li>
            ) : (
              <li>
                <Link href="/login"><i className="fa fa-sign-in"></i> Login</Link>
              </li>
            )}
          </ul>

          <ul className="nav navbar-nav navbar-right navbar-support">
            <li>
              <a href="#" className="navbar-support-border" onClick={(e) => { e.preventDefault(); setShowSupport(!showSupport); }}>
                <span className="navbar-support-container">
                  <span className="navbar-support-text">Support</span>
                  <span className="navbar-support-icon">
                    <i className="fa fa-question-circle"></i>
                  </span>
                </span>
              </a>
            </li>
          </ul>

          {user && (
            <div className="row breadcrumb-row">
              <div className="col-lg-12">
                <ul className="breadcrumb">
                  <span className="active">&gt;</span>
                  <li><Link href="/dashboard">Main</Link></li>
                  <li className="active">{pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}</li>
                </ul>
                <ul className="staging_live">
                  <li className="staging">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <i className="fa fa-check-circle"></i> Staging
                    </a>
                  </li>
                  <li className="live">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <i className="fa fa-eye"></i> Live Site
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Support dropdown */}
      {showSupport && (
        <div id="support-container" style={{ display: 'block' }}>
          <div id="support-close">
            <a href="#" className="support-close-a" onClick={(e) => { e.preventDefault(); setShowSupport(false); }}>
              <span className="support-close-text">Support</span>
              <span className="support-close-icon">
                <i className="fa fa-arrow-circle-up"></i>
              </span>
            </a>
          </div>
          <h3>Need Help?</h3>
          <p>Get answers to your questions.</p>
          <ul>
            <li className="support-faqs">
              <a href="/dashboard/help" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-thumb-tack"></i>
                HelpDesk
              </a>
            </li>
            <li>
              <a href="https://www.commercev3.com/videos/" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-film"></i>
                Training Videos
              </a>
            </li>
            <li>
              <a href="/dashboard/email-support">
                <i className="fa fa-envelope"></i>
                Email Support
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
