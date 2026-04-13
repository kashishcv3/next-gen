import Layout from '@/components/layout/Layout';
import Script from 'next/script';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Bootstrap 3 CSS */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"
      />
      {/* SB Admin CSS */}
      <link rel="stylesheet" href="/css/sb-admin.css" />
      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
      {/* DataTables CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.datatables.net/1.13.5/css/dataTables.bootstrap.min.css"
      />
      {/* Open Sans font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,800"
      />
      {/* Admin UI CSS - must be last to override */}
      <link rel="stylesheet" href="/css/adminui.css" />

      {/* jQuery + Bootstrap JS */}
      <Script
        src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"
        strategy="beforeInteractive"
      />
      {/* DataTables JS */}
      <Script
        src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.datatables.net/1.13.5/js/dataTables.bootstrap.min.js"
        strategy="afterInteractive"
      />

      <Layout>
        {children}
      </Layout>
    </>
  );
}
