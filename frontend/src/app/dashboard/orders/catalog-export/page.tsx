'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function OrderCatalogExportPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/list');
      const data = response.data;
      // Categories come as data.categories array
      const cats = data.categories || data.data || [];
      setCategories(cats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => String(c.cat_id || c.id))));
    }
  };

  const handleExport = async () => {
    if (selectedCategories.size === 0) {
      setError('Please select at least one category');
      return;
    }

    try {
      setExporting(true);
      const response = await api.get('/orders/catalog-export', {
        params: {
          categories: Array.from(selectedCategories).join(','),
          format: exportFormat,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `catalog-export.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError(null);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export catalog');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Catalog Export</h1>
      <p className="text-muted">Export product catalog for orders</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading categories...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-8">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Select Categories to Export</h3>
              </div>
              <div className="panel-body">
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategories.size === categories.length && categories.length > 0}
                      onChange={selectAll}
                    />
                    <strong>Select All Categories</strong>
                  </label>
                </div>

                <hr />

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {categories.map((category) => (
                    <div key={category.cat_id || category.id} className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(String(category.cat_id || category.id))}
                          onChange={() => toggleCategory(String(category.cat_id || category.id))}
                        />
                        {category.cat_name || category.name} ({category.prod_count || category.product_count || 0} products)
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Export Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label htmlFor="format">Export Format</label>
                  <select
                    className="form-control"
                    id="format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                    <option value="xml">XML</option>
                  </select>
                </div>

                <div className="form-group">
                  <p className="text-muted">
                    <strong>{selectedCategories.size}</strong> of <strong>{categories.length}</strong> categories selected
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleExport}
                  disabled={exporting || selectedCategories.size === 0}
                >
                  {exporting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Exporting...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-download"></i> Export Catalog
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
