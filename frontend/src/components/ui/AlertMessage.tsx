'use client';

import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export default function AlertMessage({
  type,
  message,
  onClose,
  dismissible = true,
}: AlertMessageProps) {
  const alertClass = `alert alert-${type}${dismissible ? ' alert-dismissible' : ''}`;

  return (
    <div className={alertClass} role="alert">
      {dismissible && (
        <button
          type="button"
          className="close"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {message}
    </div>
  );
}
