'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div id="wrapper">
        {/* Header includes Sidebar inside the navbar collapse div, matching old platform structure */}
        <Header />
        <div id="page-wrapper">
          {children}
          <br /><br /><br />
        </div>
      </div>
      <Footer />
    </>
  );
}
