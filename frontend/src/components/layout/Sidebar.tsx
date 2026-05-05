'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarSection {
  title: string;
  id: string;
  collapsible?: boolean;
  items: SidebarItem[];
}

interface SidebarItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isBigadmin = user?.user_type === 'bigadmin';
  const isBigadminLimit = user?.user_type === 'bigadmin_limit';
  const isDeveloper = isBigadmin || isBigadminLimit;

  // Extract siteId from pathname if present (for store-specific nav)
  const siteIdMatch = pathname.match(/\/dashboard\/links\/(\d+)/) ||
    pathname.match(/\/dashboard\/store\/[^/]+\/(\d+)/) ||
    pathname.match(/\/dashboard\/(?:products|categories|templates|images|files|recipes|vendors|orders|customers|shipping|tax|wholesale|customer-groups|rewards|marketing|campaigns|meta|metagateway|promos|reports|settings|display-options|payment|checkout)(?:\/[^/]+)?\/(\d+)/);

  // Determine which sidebar section to show based on pathname
  // Matches old platform's template_section logic
  const getActiveSection = (): string => {
    // bigadmin section: master list, mainpage (developer store list), and admin tools
    if (isDeveloper && (
      pathname.includes('/master-list') ||
      pathname.includes('/mainpage/') ||
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
      pathname.includes('/account-create') ||
      pathname.includes('/account-info') ||
      pathname.includes('/account-manage') ||
      pathname.includes('/account-delete')
    )) return 'bigadmin';

    // site section: store dashboard (links), store settings, features, changelog, general options
    if (pathname.includes('/links/') ||
      pathname.includes('/store/features') ||
      pathname.includes('/store/changelog') ||
      pathname.includes('/store/delete') ||
      pathname.includes('/store/grep') ||
      pathname.includes('/store/diff') ||
      pathname.includes('/store/setorderid') ||
      pathname.includes('/store/general-options') ||
      pathname.includes('/store/security-options') ||
      pathname.includes('/store/publish') ||
      pathname.includes('/store/domain') ||
      pathname.includes('/store/cert') ||
      pathname.includes('/alt-pages')
    ) return 'site';

    // content section
    if (pathname.includes('/products') ||
      pathname.includes('/categories') ||
      pathname.includes('/templates') ||
      pathname.includes('/store/templates') ||
      pathname.includes('/images') ||
      pathname.includes('/files') ||
      pathname.includes('/recipes') ||
      pathname.includes('/styles') ||
      pathname.includes('/vendors') ||
      pathname.includes('/display-options') ||
      pathname.includes('/catalog-display') ||
      pathname.includes('/store/dns') ||
      pathname.includes('/store/options') ||
      pathname.includes('/store/suggested-search') ||
      pathname.includes('/store/sli') ||
      pathname.includes('/auto-backups')
    ) return 'content';

    // orders section
    if (pathname.includes('/orders') ||
      pathname.includes('/customers') ||
      pathname.includes('/shipping') ||
      pathname.includes('/tax') ||
      pathname.includes('/wholesale') ||
      pathname.includes('/customer-groups') ||
      pathname.includes('/rewards') ||
      pathname.includes('/gift-card') ||
      pathname.includes('/gift-cert') ||
      pathname.includes('/member') ||
      pathname.includes('/wishlist') ||
      pathname.includes('/payment') ||
      pathname.includes('/checkout-alternative') ||
      pathname.includes('/order-management') ||
      pathname.includes('/order-mom') ||
      pathname.includes('/fraud-services') ||
      pathname.includes('/au-admin') ||
      pathname.includes('/au-document')
    ) return 'orders';

    // marketing section
    if (pathname.includes('/marketing') ||
      pathname.includes('/campaigns') ||
      pathname.includes('/meta') ||
      pathname.includes('/metagateway') ||
      pathname.includes('/promos') ||
      pathname.includes('/store/google-base') ||
      pathname.includes('/store/google-sitemap') ||
      pathname.includes('/store/uri-redirects') ||
      pathname.includes('/store/channel-advisor') ||
      pathname.includes('/store/singlefeed') ||
      pathname.includes('/store/cart-abandonment') ||
      pathname.includes('/auto-reminders') ||
      pathname.includes('/growth-options')
    ) return 'marketing';

    // analytics section
    if (pathname.includes('/reports') ||
      pathname.includes('/reporting-options')
    ) return 'analytics';

    return 'main';
  };

  const section = getActiveSection();

  // ============================================================
  // BIGADMIN SECTION - matches sidenav_main_bootstrap.tpl
  // ============================================================
  const bigadminItems: SidebarItem[] = [];

  if (isDeveloper) {
    bigadminItems.push({ label: 'New Developer', href: '/dashboard/account-create' });
    bigadminItems.push({ label: 'Move Store', href: '/dashboard/store-move' });
  }
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
  bigadminItems.push({ label: 'Preferences', href: '/dashboard/preferences' });

  const bigadminSections: SidebarSection[] = [
    { title: 'Main', id: 'menu-bigadmin', collapsible: false, items: bigadminItems },
  ];

  // ============================================================
  // MAIN SECTION - matches sidenav_main_bootstrap.tpl "main"
  // ============================================================
  const mainItems: SidebarItem[] = [];
  if (isDeveloper) {
    mainItems.push({ label: 'New Merchant', href: '/dashboard/account-create' });
  } else {
    mainItems.push({ label: 'New User', href: '/dashboard/account-add' });
  }
  mainItems.push({ label: 'New Store', href: '/dashboard/store/create' });
  if (isDeveloper) {
    mainItems.push({ label: 'Move Store', href: '/dashboard/store-move' });
  }
  mainItems.push({ label: 'My Account', href: '/dashboard/account' });
  mainItems.push({ label: 'Manage Users', href: '/dashboard/account-manage' });
  mainItems.push({ label: 'Preferences', href: '/dashboard/preferences' });
  mainItems.push({ label: 'Mass Product Import', href: '/dashboard/products/mass-import' });

  const mainSections: SidebarSection[] = [
    { title: 'Main', id: 'menu-main', collapsible: false, items: mainItems },
  ];

  // ============================================================
  // SITE SECTION - matches sidenav_store_site.tpl
  // Store dashboard, settings, admin tools
  // ============================================================
  const siteSections: SidebarSection[] = [];

  // Admin section (bigadmin only)
  if (isBigadmin) {
    siteSections.push({
      title: 'Admin', id: 'menu-admin', items: [
        { label: 'Domain Names', href: '/dashboard/store/domain' },
        { label: 'Cert Application', href: '/dashboard/store/cert' },
      ],
    });
  }

  // Settings section
  const settingsItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard/links' },
    { label: 'New Features', href: '/dashboard/store/features' },
    { label: 'Store Changelog', href: '/dashboard/store/changelog' },
    { label: 'Delete Store', href: '/dashboard/store/delete' },
  ];
  if (isBigadmin) {
    settingsItems.push({ label: 'GREP', href: '/dashboard/store/grep' });
    settingsItems.push({ label: 'Diff', href: '/dashboard/store/diff' });
    settingsItems.push({ label: 'Set Order ID', href: '/dashboard/store/setorderid' });
  }
  settingsItems.push({ label: 'General Options', href: '/dashboard/store/general-options' });
  settingsItems.push({ label: 'Security Options', href: '/dashboard/store/security-options' });

  siteSections.push({
    title: 'Settings', id: 'menu-settings', items: settingsItems,
  });

  // ============================================================
  // CONTENT SECTION - matches sidenav_store_content.tpl
  // Products, recipes, categories, design, site settings
  // ============================================================
  const contentSections: SidebarSection[] = [
    {
      title: 'Products', id: 'menu-products', items: [
        { label: 'All Products', href: '/dashboard/products/by-name' },
        { label: 'Products By Category', href: '/dashboard/products/list' },
        { label: 'Product Search', href: '/dashboard/products/search' },
        { label: 'Subscription Products', href: '/dashboard/products/subscriptions' },
        { label: 'Refined Search', href: '/dashboard/categories/refined' },
        {
          label: 'Inventory Control', href: '/dashboard/products/inventory-control',
          subItems: [
            { label: 'Inventory Control', href: '/dashboard/products/inventory-control' },
            { label: 'Inventory Control Options', href: '/dashboard/products/options/inventory' },
          ],
        },
        { label: 'Vendors', href: '/dashboard/vendors/list' },
        {
          label: 'Product Q&A', href: '/dashboard/products/qanda',
          subItems: [
            { label: 'Pending Q&A', href: '/dashboard/products/qanda' },
            { label: 'Search Q&A', href: '/dashboard/products/qanda-search' },
            { label: 'Product Q&A Options', href: '/dashboard/products/options/qanda' },
          ],
        },
        {
          label: 'Product Reviews', href: '/dashboard/products/reviews',
          subItems: [
            { label: 'Pending Reviews', href: '/dashboard/products/reviews' },
            { label: 'Search Reviews', href: '/dashboard/products/reviews-search' },
            { label: 'Product Review Export', href: '/dashboard/products/reviews-export' },
            { label: 'Product Review Options', href: '/dashboard/products/options/reviews' },
          ],
        },
        { label: 'Custom Product Forms', href: '/dashboard/products/customizations' },
        { label: 'Price Categories', href: '/dashboard/products/price-categories' },
        { label: 'Product Discounts', href: '/dashboard/products/discount-list' },
        { label: 'Product Import', href: '/dashboard/products/import' },
        { label: 'Product Export', href: '/dashboard/products/export' },
        {
          label: 'Product Options', href: '/dashboard/products/options/core',
          subItems: [
            { label: 'Core Options', href: '/dashboard/products/options/core' },
            { label: 'Ebook Options', href: '/dashboard/products/options/ebook' },
            { label: 'Product Notification Options', href: '/dashboard/products/options/notify' },
            { label: 'Product Customization', href: '/dashboard/products/options/product-customization' },
          ],
        },
      ],
    },
    {
      title: 'Recipes', id: 'menu-recipes', items: [
        { label: 'All Recipes', href: '/dashboard/recipes/list' },
        {
          label: 'Recipe Reviews', href: '/dashboard/recipes/reviews',
          subItems: [
            { label: 'Pending Reviews', href: '/dashboard/recipes/reviews' },
            { label: 'Search Reviews', href: '/dashboard/recipes/reviews-search' },
            { label: 'Review Options', href: '/dashboard/recipes/options/reviews' },
          ],
        },
      ],
    },
    {
      title: 'Categories', id: 'menu-categories', items: [
        { label: 'All Categories', href: '/dashboard/categories/list' },
        { label: 'Category Filters', href: '/dashboard/categories/filter' },
        { label: 'Category Import', href: '/dashboard/categories/import' },
        { label: 'Category Export', href: '/dashboard/categories/export' },
      ],
    },
    {
      title: 'Store Templates & Files', id: 'menu-store-templates', items: [
        { label: 'Store Templates', href: '/dashboard/store/templates/list' },
        { label: 'Add Store Template', href: '/dashboard/store/templates/add' },
        { label: 'Store Configuration', href: '/dashboard/store/templates/settings' },
      ],
    },
    {
      title: 'Dashboard Templates', id: 'menu-dashboard-templates', items: [
        { label: 'Template Library', href: '/dashboard/templates/list' },
        { label: 'Template Tags', href: '/dashboard/templates/tags' },
        { label: 'Generic Forms', href: '/dashboard/templates/forms' },
      ],
    },
    {
      title: 'Design & Assets', id: 'menu-design', items: [
        { label: 'Image Library', href: '/dashboard/images/list' },
        { label: 'File Library', href: '/dashboard/files/list' },
        { label: 'Automatic Backups', href: '/dashboard/auto-backups' },
      ],
    },
    {
      title: 'Site Settings', id: 'menu-site-settings', items: [
        ...(isBigadmin ? [{ label: 'Domain Names', href: '/dashboard/store/domain' }] : []),
        { label: 'DNS Records', href: '/dashboard/store/dns' },
        ...(isBigadmin ? [{ label: 'Security Certificates', href: '/dashboard/store/cert' }] : []),
        {
          label: 'Display Options', href: '/dashboard/display-options/core',
          subItems: [
            { label: 'Core Display Options', href: '/dashboard/display-options/core' },
            { label: 'Catalog Display Options', href: '/dashboard/catalog-display/core' },
            { label: 'Checkout Options', href: '/dashboard/display-options/checkout' },
            { label: 'Optimization Options', href: '/dashboard/display-options/optimization' },
          ],
        },
        {
          label: 'Site Search Options', href: '/dashboard/display-options/search',
          subItems: [
            { label: 'Core Search Options', href: '/dashboard/display-options/search' },
            { label: 'Suggested Search', href: '/dashboard/store/suggested-search' },
            { label: 'SLI', href: '/dashboard/store/sli' },
          ],
        },
      ],
    },
  ];

  // ============================================================
  // ORDERS SECTION - matches sidenav_store_orders.tpl
  // ============================================================
  const ordersSections: SidebarSection[] = [
    {
      title: 'Orders', id: 'menu-orders', items: [
        { label: 'Pending Orders', href: '/dashboard/orders/pending' },
        { label: 'Order Search', href: '/dashboard/orders/list' },
        { label: 'Order Status Import', href: '/dashboard/orders/status-import' },
        { label: 'Order History Import', href: '/dashboard/orders/history-import' },
        { label: 'Order Options', href: '/dashboard/orders/options' },
        { label: 'Fraud Services', href: '/dashboard/orders/fraud-services' },
      ],
    },
    {
      title: 'Gift Certificates', id: 'menu-gift-certs', items: [
        { label: 'Gift Certificate Emails', href: '/dashboard/orders/gc-emails' },
        { label: 'Gift Certificates Report', href: '/dashboard/reports/gift-cards' },
        { label: 'Gift Certificate Options', href: '/dashboard/orders/options/gift' },
        {
          label: 'Gift Certificate Services', href: '/dashboard/gift-card-service/custom',
          subItems: [
            { label: 'Custom Service', href: '/dashboard/gift-card-service/custom' },
            { label: 'Smart Transaction', href: '/dashboard/gift-card-service/smart' },
            { label: 'Valutec', href: '/dashboard/gift-card-service/valutec' },
            { label: 'ArrowEye', href: '/dashboard/gift-card-service/arroweye' },
            { label: 'WTG', href: '/dashboard/gift-card-service/wtg' },
            { label: 'Aloha', href: '/dashboard/gift-card-service/aloha' },
            { label: 'Elavon', href: '/dashboard/gift-card-service/elavon' },
            { label: 'TenderCard', href: '/dashboard/gift-card-service/tendercard' },
          ],
        },
      ],
    },
    {
      title: 'Catalog Request', id: 'menu-catalog-request', items: [
        { label: 'Catalog Request Export', href: '/dashboard/orders/catalog-export' },
      ],
    },
    {
      title: 'Customers', id: 'menu-customers', items: [
        { label: 'Customer Search', href: '/dashboard/customers/search' },
        { label: 'Customer Groups', href: '/dashboard/customer-groups/list' },
        { label: 'Customer Data', href: '/dashboard/customer-groups/data' },
        {
          label: 'Site Members', href: '/dashboard/members/search',
          subItems: [
            { label: 'Member Search', href: '/dashboard/members/search' },
            { label: 'Member Options', href: '/dashboard/orders/options/member' },
          ],
        },
        { label: 'Wishlists', href: '/dashboard/wishlist' },
        { label: 'Rewards Program', href: '/dashboard/rewards/list' },
        {
          label: 'AU Customers', href: '/dashboard/au-admin',
          subItems: [
            { label: 'AU User Management', href: '/dashboard/au-admin' },
            { label: 'AU Document Management', href: '/dashboard/au-document-upload' },
          ],
        },
      ],
    },
    {
      title: 'Wholesale', id: 'menu-wholesale', items: [
        { label: 'Wholesale Orders', href: '/dashboard/wholesale/orders' },
        { label: 'Approve Wholesalers', href: '/dashboard/wholesale/approve' },
        { label: 'Search Wholesalers', href: '/dashboard/wholesale/list' },
        { label: 'Wholesale Shipping', href: '/dashboard/wholesale/shipping-list' },
      ],
    },
    {
      title: 'Shipping Options', id: 'menu-shipping', items: [
        { label: 'Core Options', href: '/dashboard/shipping/options' },
        { label: 'Shipping Tables', href: '/dashboard/shipping/list' },
        { label: 'Shipping Groups', href: '/dashboard/shipping/groups' },
        { label: 'Preset Ship Dates', href: '/dashboard/shipping/options/preset-dates' },
        { label: 'Blackout Dates', href: '/dashboard/shipping/options/blackout' },
        { label: 'Dimensional Shipping', href: '/dashboard/shipping/options/dimensional' },
        {
          label: 'Shipping Integrations', href: '/dashboard/shipping/rate-tool/custom',
          subItems: [
            { label: 'Custom', href: '/dashboard/shipping/rate-tool/custom' },
            { label: 'UPS', href: '/dashboard/shipping/rate-tool/ups' },
            { label: 'FedEx', href: '/dashboard/shipping/rate-tool/fedex' },
            { label: 'USPS', href: '/dashboard/shipping/rate-tool/usps' },
            { label: 'ABF', href: '/dashboard/shipping/rate-tool/abf' },
            { label: 'Conway', href: '/dashboard/shipping/rate-tool/conway' },
            { label: 'ShipWorks', href: '/dashboard/shipping/options/shipworks' },
          ],
        },
      ],
    },
    {
      title: 'Tax Options', id: 'menu-tax', items: [
        { label: 'Core Options', href: '/dashboard/tax/options' },
        { label: 'Tax Tables', href: '/dashboard/tax/list' },
        {
          label: 'Tax Calculations', href: '/dashboard/tax/rate-tool/custom',
          subItems: [
            { label: 'Custom', href: '/dashboard/tax/rate-tool/custom' },
            { label: 'Avalara', href: '/dashboard/tax/rate-tool/avalara' },
            { label: 'Mach', href: '/dashboard/tax/rate-tool/mach' },
            { label: 'TaxJar', href: '/dashboard/tax/rate-tool/taxjar' },
            { label: 'Thomson Reuters', href: '/dashboard/tax/rate-tool/thomsonreuters' },
          ],
        },
      ],
    },
    {
      title: 'Payment Options', id: 'menu-payment', items: [
        { label: 'Core Options', href: '/dashboard/payment/options/core' },
        {
          label: 'Credit Cards', href: '/dashboard/payment/options/creditcards',
          subItems: [
            { label: 'Core Options', href: '/dashboard/payment/options/creditcards' },
            { label: 'Payment Gateways', href: '/dashboard/payment/options/paymentgateways' },
            { label: 'Tokenization Services', href: '/dashboard/payment/options/tokenization' },
            { label: 'Wallet And Payment Method', href: '/dashboard/payment/options/wallet' },
          ],
        },
        { label: 'Electronic Checks', href: '/dashboard/payment/options/echecks' },
      ],
    },
    {
      title: 'Fulfillment Options', id: 'menu-fulfillment', items: [
        { label: 'Order Management', href: '/dashboard/order-management' },
        { label: 'MOM Builder', href: '/dashboard/order-mom-builder' },
        {
          label: 'Alternative Checkouts', href: '/dashboard/checkout-alternative/paypal',
          subItems: [
            { label: 'PayPal Options', href: '/dashboard/checkout-alternative/paypal' },
            { label: 'Amazon Pay Options', href: '/dashboard/checkout-alternative/amazon-pay' },
            { label: 'FedEx Cross Border', href: '/dashboard/checkout-alternative/bongo' },
            { label: 'Sezzle Options', href: '/dashboard/checkout-alternative/sezzle' },
            { label: 'Visa Checkout Options', href: '/dashboard/checkout-alternative/visa' },
          ],
        },
      ],
    },
  ];

  // ============================================================
  // MARKETING SECTION - matches sidenav_store_marketing.tpl
  // ============================================================
  const marketingSections: SidebarSection[] = [
    {
      title: 'Optimization', id: 'menu-optimization', items: [
        { label: 'Meta Tags', href: '/dashboard/meta/list' },
        { label: 'Gateway Pages', href: '/dashboard/metagateway/list' },
        { label: 'Gateway Page Tracking', href: '/dashboard/reports/gateway-tracking' },
        { label: 'Google Sitemap', href: '/dashboard/store/google-sitemap' },
        { label: 'Structured Data', href: '/dashboard/marketing/options/structured-data' },
        { label: 'URI Redirects', href: '/dashboard/store/uri-redirects' },
        { label: 'Hubspot Options', href: '/dashboard/marketing/options/hubspot' },
      ],
    },
    {
      title: 'Email Campaigns', id: 'menu-email-campaigns', items: [
        { label: 'Basic Email Service', href: '/dashboard/campaigns/list' },
        { label: 'Email Bounce Report', href: '/dashboard/reports/bounce' },
        { label: 'Email Campaign Options', href: '/dashboard/growth-options/email' },
        { label: 'Email List Management', href: '/dashboard/marketing/email' },
        { label: 'Opt-Out Report', href: '/dashboard/reports/optout' },
        {
          label: 'Third Party Options', href: '/dashboard/marketing/options/bronto',
          subItems: [
            { label: 'Bronto Options', href: '/dashboard/marketing/options/bronto' },
            { label: 'Rejoiner Options', href: '/dashboard/marketing/options/rejoiner' },
            { label: 'Mailchimp Options', href: '/dashboard/marketing/options/mailchimp' },
            { label: 'dotmailer Options', href: '/dashboard/marketing/options/dotmailer' },
            { label: 'Klaviyo Options', href: '/dashboard/marketing/options/klaviyo' },
          ],
        },
      ],
    },
    {
      title: 'Promotions', id: 'menu-promos', items: [
        { label: 'Promotions', href: '/dashboard/promos/list' },
      ],
    },
    {
      title: 'Automatic Reminders', id: 'menu-reminders', items: [
        { label: 'Automatic Reminders', href: '/dashboard/auto-reminders' },
      ],
    },
    {
      title: 'Product Syndication', id: 'menu-syndication', items: [
        { label: 'Google Product Review', href: '/dashboard/store/google-base-review' },
        { label: 'Google Shopper', href: '/dashboard/store/google-base' },
        { label: 'ChannelAdvisor', href: '/dashboard/store/channel-advisor' },
        { label: 'SingleFeed', href: '/dashboard/store/singlefeed' },
      ],
    },
    {
      title: 'Cart Abandonment', id: 'menu-cart-abandon', items: [
        { label: 'Cart Abandonment', href: '/dashboard/store/cart-abandonment' },
        { label: 'Cart Abandonment Report', href: '/dashboard/reports/cart-abandonment' },
        { label: 'Cart Abandonment Options', href: '/dashboard/growth-options/abandon' },
      ],
    },
  ];

  // ============================================================
  // ANALYTICS SECTION - matches sidenav_store_analytics.tpl
  // ============================================================
  const analyticsSections: SidebarSection[] = [
    {
      title: 'Analytics', id: 'menu-analytics', items: [
        { label: 'Benchmark', href: '/dashboard/reports/overview' },
        { label: 'Bot Tracker', href: '/dashboard/reports/bot-tracker' },
        { label: 'Catalog Requests', href: '/dashboard/reports/catalog-requests' },
        { label: 'Comparatives', href: '/dashboard/reports/comparatives' },
        { label: 'Incentive Programs', href: '/dashboard/reports/incentive-programs' },
        { label: 'Inventory Notifications', href: '/dashboard/reports/inventory-notify' },
        { label: 'Order Detail', href: '/dashboard/reports/order-detail' },
        { label: 'Product Aging', href: '/dashboard/reports/product-aging' },
        { label: 'Referrers', href: '/dashboard/reports/referrers' },
        { label: 'Revenue', href: '/dashboard/reports/revenue' },
        { label: 'Sales Rank', href: '/dashboard/reports/salesrank' },
        { label: 'Search Terms', href: '/dashboard/reports/search-terms' },
        {
          label: 'Site Optimization', href: '/dashboard/reports/site-optimization/performance',
          subItems: [
            { label: 'Performance', href: '/dashboard/reports/site-optimization/performance' },
            { label: 'Best Practices', href: '/dashboard/reports/site-optimization/best-practices' },
          ],
        },
        { label: 'Square In. Analyzer', href: '/dashboard/reports/sqin-analyzer' },
        { label: 'Tell a Friend', href: '/dashboard/reports/tell-a-friend' },
        { label: 'Visits', href: '/dashboard/reports/visitors' },
        { label: 'Wishlist Products', href: '/dashboard/reports/wishlist' },
      ],
    },
    {
      title: 'Reporting Options', id: 'menu-reporting-options', items: [
        { label: 'Core Reporting Options', href: '/dashboard/reporting-options/core' },
        { label: 'Incentive Program Options', href: '/dashboard/reporting-options/incentive' },
      ],
    },
  ];

  // Pick sections based on active section
  let sections: SidebarSection[];
  switch (section) {
    case 'bigadmin': sections = bigadminSections; break;
    case 'site': sections = siteSections; break;
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
  const hasActiveItem = section.items.some(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(item.href + '/') ||
      item.subItems?.some((si) => pathname === si.href || pathname.startsWith(si.href + '/'))
  );
  const [isOpen, setIsOpen] = useState(section.collapsible === false ? true : hasActiveItem);

  return (
    <li className={section.collapsible === false || hasActiveItem ? 'active' : ''}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        data-toggle="collapse"
        data-target={`#${section.id}`}
      >
        {section.title}{' '}
        <i
          className={`fa fa-caret-${isOpen ? 'down' : 'right'}`}
          style={{ float: 'right', marginTop: '4px' }}
        ></i>
      </a>
      <ul className={`collapse ${isOpen ? 'in' : ''}`} id={section.id}>
        {section.items.map((item) => {
          // If item has subItems, render as a nested expandable
          if (item.subItems && item.subItems.length > 0) {
            return (
              <SidebarSubGroup
                key={item.href}
                item={item}
                pathname={pathname}
              />
            );
          }
          return (
            <li
              key={item.href}
              className={
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'active'
                  : ''
              }
            >
              <Link href={item.href}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function SidebarSubGroup({ item, pathname }: { item: SidebarItem; pathname: string }) {
  const hasActiveSub = item.subItems?.some(
    (si) => pathname === si.href || pathname.startsWith(si.href + '/')
  );
  const [isOpen, setIsOpen] = useState(!!hasActiveSub);
  const subId = `sub-${item.href.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <li className={hasActiveSub ? 'active' : ''}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        style={{ paddingLeft: '20px' }}
      >
        {item.label}{' '}
        <i
          className={`fa fa-caret-${isOpen ? 'down' : 'right'}`}
          style={{ float: 'right', marginTop: '4px' }}
        ></i>
      </a>
      {isOpen && (
        <ul className="collapse in" id={subId} style={{ listStyle: 'none', paddingLeft: '10px' }}>
          {item.subItems!.map((sub) => (
            <li
              key={sub.href}
              className={
                pathname === sub.href || pathname.startsWith(sub.href + '/')
                  ? 'active'
                  : ''
              }
            >
              <Link href={sub.href}>{sub.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
