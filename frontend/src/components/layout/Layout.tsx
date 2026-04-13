'use client';

import React, { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div id="wrapper">
        <Header />
        <Sidebar />
        <div id="page-wrapper">
          {children}
          <br /><br /><br />
        </div>
      </div>
      <Footer />
    </>
  );
}
