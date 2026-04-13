'use client';

import React, { ReactNode } from 'react';

interface PopupLayoutProps {
  children: ReactNode;
  title?: string;
  showFooter?: boolean;
}

export default function PopupLayout({
  children,
  title,
  showFooter = true,
}: PopupLayoutProps) {
  return (
    <div className="popup-wrapper" style={{ padding: '20px' }}>
      {title && (
        <div className="popup-header" style={{ marginBottom: '20px' }}>
          <h3>{title}</h3>
        </div>
      )}

      <div className="popup-body">{children}</div>

      {showFooter && (
        <div
          className="popup-footer"
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e5e5',
            textAlign: 'center',
          }
        >
          <p className="text-muted" style={{ fontSize: '12px' }}>
            CV3 Admin Platform
          </p>
        </div>
      )}
    </div>
  );
}
