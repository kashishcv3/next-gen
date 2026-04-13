'use client';

import React, { ReactNode } from 'react';

interface PanelProps {
  type?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'danger';
  heading?: string | ReactNode;
  children: ReactNode;
  footer?: string | ReactNode;
  className?: string;
}

export default function Panel({
  type = 'default',
  heading,
  children,
  footer,
  className = '',
}: PanelProps) {
  const panelClass = `panel panel-${type} ${className}`;

  return (
    <div className={panelClass}>
      {heading && (
        <div className="panel-heading">
          {typeof heading === 'string' ? <h3 className="panel-title">{heading}</h3> : heading}
        </div>
      )}
      <div className="panel-body">{children}</div>
      {footer && <div className="panel-footer">{footer}</div>}
    </div>
  );
}
