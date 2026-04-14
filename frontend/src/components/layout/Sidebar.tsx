'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarSection {
  title: string;
  id: string;
  collapsible?: boolean;
  items: { label: string; href: string; subItems?: { label: string; href: string }[] }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine if we are in the "bigadmin" section (matches old platform template_section="bigadmin")
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
    pathname.includes('/training-videos') ||
    pathname.includes('/account-create');

  const isBigadmin = user?.user_type === 'bigadmin';
  const isBigadminLimit = user?.user_type === 'bigadmin_limit';

  // Determine which sidebar section to show based on pathname
  const getActiveSection = () => {
    if (isBigadminSection && (isBigadmin || isBigadminLimit)) return 'bigadmin';
    if (pathname.includes('/products') || pathname.includes('/categories') || pathname.includes('/templates') || pathname.includes('/images') || pathname.includes('/files') || pathname.includes('/recipes') || pathname.includes('/styles') || pathname.includes('/vendors')) return 'content';
    if (pathname.includes('/orders') || pathname.includes('/customers') || pathname.includes('/shipping') || pathname.includes('/tax') || pathname.includes('/wholesale') || pathname.includes('/customer-groups') || pathname.includes('/rewards')) return 'orders';
    if (pathname.includes('/marketing') || pathname.includes('/campaigns') || pathname.includes('/meta') || pathname.includes('/promos') || pathname.includes('/metagateway')) return 'marketing';
    if (pathname.includes('/reports')) return 'analytics';
    return 'main';
  };

  const section = getActiveSection();

  // Bigadmin section - matches old platform sidenav_main_bootstrap.tpl lines 28-51
  const bigadminItems: { label: string; href: string }[] = [];

  // Both bigadmin and bigadmin_limit get these
  if (isBigadmin || isBigadminLimit) {
    bigadminItems.push({ label: 'New Developer', href: '/dashboard/account-create' });
    bigadminItems.push({ label: 'Move Store', href: '/dashboard/store-move' });
  }

  // bigadmin only (not bigadmin_limit) gets these additional items
  if (isBigadmin) {
    bigadminItems.push({ label: 'Blast Queue', href: '/dashboard/store-blastqueue' });
    bigadminItems.push({ label: 'Who Where', href: '/dashboard/store-who-where' });
    bigadminItems.push({ label: 'Store Contracts', href: '/dashboard/store-contracts' });
    bigadminItems.push({ label: 'Store Options', href: '/dashboard/store-storeoptions' });
    bigadminItems.push({ label: 'Admin Messages', href: '/dashboard/store-loginpagemessages' });
    bigadminItems.push({ label: 'Benchmark Exclude', href: '/dashboard/store-benchmark-exclude' });
    bigadminItems.push({ label: 'Block List', href: '/dashboard/store-block-list' });
    bigadminItems.push({ label: 'Help Manuals', href: '/dashboard/help-manuals' });
    bigadminItems.push({ label: 'Training Videos', href: '/dashboard/training-videos' });
  }

  // All bigadmin users get Preferences
  bigadminItems.push({ label: 'Preferences', href: '/dashboard/preferences' });

  const bigadminSections: SidebarSection[] = [
    {
      title: 'Main',
      id: 'menu-bigadmin',
      collapsible: false,
      items: bigadminItems,
    },
  ];

  const mainSections: SidebarSection[] = [
    { title: 'Main', id: 'menu-main', collapsible: false, items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Account', href: '/dashboard/account' },
      { label: 'Preferences', href: '/dashboard/preferences' },
    ]},
  ];

  const contentSections: SidebarSection[] = [
    { title: 'Products', id: 'menu-products', items: [
      { label: 'All Products', href: '/dashboard/products/by-name' },
      { label: 'Products By Category', href: '/dashboard/products/list' },
      { label: 'Product Search', href: '/dashboard/products/search' },
      { label: 'Vendors', href: '/dashboard/vendors/list' },
      { label: 'Product Import', href: '/dashboard/products/import' },
      { label: 'Product Export', href: '/dashboard/products/export' },
    ]},
    { title: 'Recipes', id: 'menu-recipes', items: [
      { label: 'All Recipes', href: '/dashboard/recipes/list' },
    ]},
    { title: 'Categories', id: 'menu-categories', items: [
      { label: 'All Categories', href: '/dashboard/categories/list' },
      { label: 'Category Filters', href: '/dashboard/categories/filter' },
      { label: 'Category Import', href: '/dashboard/categories/import' },
      { label: 'Category Export', href: '/dashboard/categories/export' },
    ]},
    { title: 'Design', id: 'menu-design', items: [
      { label: 'Template Library', href: '/dashboard/templates/list' },
      { label: 'Template Tags', href: '/dashboard/templates/tags' },
      { label: 'Image Library', href: '/dashboard/images/list' },
      { label: 'File Library', href: '/dashboard/files/list' },
      { label: 'Generic Forms', href: '/dashboard/templates/forms' },
      { label: 'Automatic Backups', href: '/dashboard/auto-backups' },
    ]},
    { title: 'Site Settings', id: 'menu-site-settings', items: [
      { label: 'Display Options', href: '/dashboard/store/options' },
      { label: 'DNS Records', href: '/dashboard/store/dns' },
    ]},
  ];

  const ordersSections: SidebarSection[] = [
    { title: 'Orders', id: 'menu-orders', items: [
      { label: 'Pending Orders', href: '/dashboard/orders/pending' },
      { label: 'Order Search', href: '/dashboard/orders/list' },
      { label: 'Order Status Import', href: '/dashboard/orders/status-import' },
      { label: 'Order Options', href: '/dashboard/orders/options' },
    ]},
    { title: 'Customers', id: 'menu-customers', items: [
      { label: 'Customer Search', href: '/dashboard/customers/search' },
      { label: 'Customer Groups', href: '/dashboard/customer-groups/list' },
      { label: 'Customer Data', href: '/dashboard/customer-groups/data' },
      { label: 'Wishlists', href: '/dashboard/wishlist' },
      { label: 'Rewards Program', href: '/dashboard/rewards/list' },
    ]},
    { title: 'Wholesale', id: 'menu-wholesale', items: [
      { label: 'Wholesale Orders', href: '/dashboard/wholesale/orders' },
      { label: 'Approve Wholesalers', href: '/dashboard/wholesale/approve' },
      { label: 'Search Wholesalers', href: '/dashboard/wholesale/list' },
    ]},
    { title: 'Shipping Options', id: 'menu-shipping', items: [
      { label: 'Core Options', href: '/dashboard/shipping/options' },
      { label: 'Shipping Tables', href: '/dashboard/shipping/list' },
      { label: 'Shipping Groups', href: '/dashboard/shipping/groups' },
    ]},
    { title: 'Tax Options', id: 'menu-tax', items: [
      { label: 'Core Options', href: '/dashboard/tax/options' },
      { label: 'Tax Tables', href: '/dashboard/tax/list' },
    ]},
    { title: 'Payment Options', id: 'menu-payment', items: [
      { label: 'Core Options', href: '/dashboard/settings/payment' },
    ]},
  ];

  const marketingSections: SidebarSection[] = [
    { title: 'SEO', id: 'menu-seo', items: [
      { label: 'Meta Tags', href: '/dashboard/meta/list' },
      { label: 'Meta Gateways', href: '/dashboard/metagateway/list' },
      { label: 'URI Redirects', href: '/dashboard/store/uri-redirects' },
    ]},
    { title: 'Email Marketing', id: 'menu-email', items: [
      { label: 'Email Campaigns', href: '/dashboard/campaigns/list' },
      { label: 'Email Marketing', href: '/dashboard/marketing/overview' },
    ]},
    { title: 'Promotions', id: 'menu-promos', items: [
      { label: 'Promotions', href: '/dashboard/promos/list' },
      { label: 'Google Shopping', href: '/dashboard/store/google-base' },
    ]},
  ];

  const analyticsSections: SidebarSection[] = [
    { title: 'Reports', id: 'menu-reports', items: [
      { label: 'Benchmark', href: '/dashboard/reports/overview' },
      { label: 'Sales Rank', href: '/dashboard/reports/salesrank' },
      { label: 'Visitors', href: '/dashboard/reports/visitors' },
      { label: 'Referrers', href: '/dashboard/reports/referrers' },
      { label: 'Search Terms', href: '/dashboard/reports/search-terms' },
      { label: 'Cart Abandonment', href: '/dashboard/reports/cart-abandonment' },
      { label: 'Gift Certificates', href: '/dashboard/reports/gift-cards' },
      { label: 'Inventory Notify', href: '/dashboard/reports/inventory-notify' },
    ]},
  ];

  let sections: SidebarSection[];
  switch (section) {
    case 'bigadmin': sections = bigadminSections; break;
    case 'content': sections = contentSections; break;
    case 'orders': sections = ordersSections; break;
    case 'marketing': sections = marketingSections; break;
    case 'analytics': sections = analyticsSections; break;
    default: sections = mainSections;
  }

  return (
    <ul className="nav side-nav">
      {sections.map((sec) => (
        <SidebarGroup key={sec.id} section={sec} pathname={pathname} />
      ))}
    </ul>
  );
}

function SidebarGroup({ section, pathname }: { section: SidebarSection; pathname: string }) {
  const hasActiveItem = section.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  const [isOpen, setIsOpen] = useState(section.collapsible === false ? true : hasActiveItem);

  // For non-collapsible sections (like bigadmin "Main"), render items directly
  if (section.collapsible === false) {
    return (
      <>
        <li className="active">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
            data-toggle="collapse"
            data-target={`#${section.id}`}
          >
            {section.title} <i className={`fa fa-caret-${isOpen ? 'down' : 'right'}`} style={{ float: 'right', marginTop: '4px' }}></i>
          </a>
          <ul className={`collapse ${isOpen ? 'in' : ''}`} id={section.id}>
            {section.items.map((item) => (
              <li key={item.href} className={pathname === item.href || pathname.startsWith(item.href + '/') || pathname.startsWith(item.href + '?') ? 'active' : ''}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </li>
      </>
    );
  }

  return (
    <li className={hasActiveItem ? 'active' : ''}>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        data-toggle="collapse"
        data-target={`#${section.id}`}
      >
        {section.title}
      </a>
      <ul className={`collapse ${isOpen ? 'in' : ''}`} id={section.id}>
        {section.items.map((item) => (
          <li key={item.href} className={pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
