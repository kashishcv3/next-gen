'use client';

import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'datatables.net-bs';

interface DataTableProps {
  data: any[];
  columns: string[];
  columnDefs?: any[];
  responsive?: boolean;
  pageLength?: number;
  searching?: boolean;
  ordering?: boolean;
  info?: boolean;
  paging?: boolean;
  striped?: boolean;
  hover?: boolean;
  condensed?: boolean;
  bordered?: boolean;
  onRowClick?: (row: any, index: number) => void;
  className?: string;
}

export default function DataTable({
  data,
  columns,
  columnDefs = [],
  responsive = true,
  pageLength = 10,
  searching = true,
  ordering = true,
  info = true,
  paging = true,
  striped = true,
  hover = true,
  condensed = false,
  bordered = false,
  onRowClick,
  className = '',
}: DataTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // Destroy existing DataTable if it exists
    if (dataTableRef.current) {
      dataTableRef.current.DataTable().destroy();
    }

    // Initialize DataTable
    const $table = $(tableRef.current);
    dataTableRef.current = $table.DataTable({
      data,
      columns: columns.map((col) => ({ title: col, data: col.toLowerCase().replace(' ', '_') })),
      columnDefs,
      pageLength,
      responsive,
      searching,
      ordering,
      info,
      paging,
      dom: 'Bfrtip',
      language: {
        lengthMenu: 'Display _MENU_ records per page',
        zeroRecords: 'No matching records found',
        info: 'Showing _START_ to _END_ of _TOTAL_ records',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
      },
    });

    // Handle row click if callback provided
    if (onRowClick) {
      $table.on('click', 'tbody tr', function () {
        const row = dataTableRef.current.DataTable().row(this).data();
        const index = dataTableRef.current.DataTable().row(this).index();
        onRowClick(row, index);
      });
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.DataTable().destroy();
      }
    };
  }, [data, columns, columnDefs, pageLength, responsive, searching, ordering, info, paging, onRowClick]);

  const tableClass = [
    'table',
    striped && 'table-striped',
    hover && 'table-hover',
    condensed && 'table-condensed',
    bordered && 'table-bordered',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <table ref={tableRef} className={tableClass} />;
}
