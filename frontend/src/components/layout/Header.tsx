'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function Header() {
  const { user, logout } = useAuth();
  const { siteId } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showSupport, setShowSupport] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determine if we are in a "bigadmin" section (no store context)
  // In the old platform, template_section="bigadmin" for master_list, account_create (devs), store_move, etc.
  const isBigadminSection = pathname.includes('/master-list') ||
    pathname.includes('/store-move') ||
    pathname.includes('/store-blastqueue') ||
    pathname.includes('/store-who-where') ||
    pathname.includes('/store-contracts') ||
    pathname.includes('/store-storeoptions') ||
    pathname.includes('/store-loginpagemessages') ||
    pathname.includes('/store-benchmark-exclude') ||
    pathname.includes('/store-block-list') ||
    pathname.includes('/help-manuals') ||
    pathname.includes('/training-videos');

  // "Main" section pages - no store selected, but not bigadmin either
  // In the old platform, mainpage shows a developer's stores - still no $company context
  const isMainSection = pathname.includes('/mainpage') ||
    pathname.includes('/account-create') ||
    pathname.includes('/account-info') ||
    pathname.includes('/account-delete') ||
    pathname.includes('/account-manage') ||
    pathname.includes('/preferences');

  // In the old platform, the top nav items (Dashboard, Orders, Content, Marketing, Analytics)
  // are only shown when $company is set (a store is selected). On bigadmin/main pages, no store is selected.
  const hasStoreContext = !isBigadminSection && !isMainSection && pathname !== '/dashboard' && pathname !== '/dashboard/main';

  // Determine active section from pathname (only relevant when store context exists)
  const getActiveSection = () => {
    if (pathname.includes('/products') || pathname.includes('/categories') || pathname.includes('/templates') || pathname.includes('/images') || pathname.includes('/files') || pathname.includes('/recipes') || pathname.includes('/styles')) return 'content';
    if (pathname.includes('/orders') || pathname.includes('/customers') || pathname.includes('/shipping') || pathname.includes('/tax') || pathname.includes('/wholesale')) return 'orders';
    if (pathname.includes('/marketing') || pathname.includes('/campaigns') || pathname.includes('/meta') || pathname.includes('/promos')) return 'marketing';
    if (pathname.includes('/reports')) return 'analytics';
    return 'site';
  };

  const activeSection = getActiveSection();

  // Build breadcrumb label from pathname
  const getBreadcrumbLabel = () => {
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last || last === 'dashboard') return 'Dashboard';
    return last.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      {/* Old platform structure: <nav> contains navbar-header, collapse (top-nav, breadcrumb, side-nav) */}
      <nav className="navbar navbar-cv3" role="navigation">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link className="navbar-brand" href={user?.uid ? `/dashboard/mainpage/${user.uid}` : '/dashboard'}>
            <img src="/images/cv3_logo_white.png" alt="CV3" style={{ marginTop: '10px' }} />
          </Link>
        </div>
        <div id="mobile-menu">
          <i className="fa fa-bars fa-2x"></i>
        </div>

        <div className="collapse navbar-collapse navbar-ex1-collapse">
          <ul className="nav navbar-nav top-nav">
            {/* Only show store nav items when a store is selected (matches old platform {if $company}) */}
            {hasStoreContext && (
              <>
                <li className={activeSection === 'site' ? 'active' : ''}>
                  <Link href={siteId ? `/dashboard/links/${siteId}` : '/dashboard'}><i className="fa fa-cube"></i> Dashboard</Link>
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
              </>
            )}
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
                <ul className="breadcrumb" style={!hasStoreContext ? { width: '100%' } : undefined}>
                  <span className="active">&gt;</span>
                  <li><Link href="/dashboard">Main</Link></li>
                  {isBigadminSection && (
                    <li className="active">{getBreadcrumbLabel()}</li>
                  )}
                </ul>
                {/* Only show Staging/Live when a store is selected (matches old platform {if $company}) */}
                {hasStoreContext && (
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
                )}
              </div>
            </div>
          )}

          {/* Sidebar is inside the navbar collapse div, matching old platform header.tpl structure */}
          {user && <Sidebar />}

        </div>{/* /.navbar-collapse */}
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
