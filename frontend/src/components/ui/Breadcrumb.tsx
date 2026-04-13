'use client';

import React from 'react';
import Link from 'next/link';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ol className="breadcrumb">
      {items.map((item, index) => (
        <li key={index} className={index === items.length - 1 ? 'active' : ''}>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            item.label
          )}
        </li>
      ))}
    </ol>
  );
}
