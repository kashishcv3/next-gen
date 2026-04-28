'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <>
      <div id="wrapper">
        {/* Header contains top nav + breadcrumb only (sidebar removed from Header) */}
        <Header />
        <div id="content-area" style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', width: '100%' }}>
          {/* Sidebar as left column */}
          {user && <Sidebar />}
          {/* Page content as right column */}
          <div id="page-wrapper">
            {children}
            <br /><br /><br />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
