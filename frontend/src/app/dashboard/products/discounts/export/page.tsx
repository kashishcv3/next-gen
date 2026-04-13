'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Discount {
  id: string;
  product_name: string;
  discount_percentage: number;
  discount_amount: number;
}

export default function ProductDiscountExportPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState(',');

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/discounts');
      setDiscounts(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (discountId: string, checked: boolean) => {
    if (checked) {
      setSelectedDiscounts([...selectedDiscounts, discountId]);
    } else {
      setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    }
  };

  const handleSelectAll = () => {
    if (selectedDiscounts.length === discounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(discounts.map(d => d.id));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await api.post('/products/discounts/export', {
        discount_ids: selectedDiscounts,
        delimiter: delimiter,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `discounts-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild?.removeChild(link);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Export Discounts</h1>
          <p>
            <i className="fa fa-download"></i> Select discounts to export as CSV.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">Export Settings</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label>Delimiter</label>
                <select
                  className="form-control"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
            </div>
          </div>

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Select Discounts</h3>
            </div>
            <div className="panel-body">
              <button
                type="button"
                className="btn btn-default"
                onClick={handleSelectAll}
                style={{ marginBottom: '10px' }}
              >
                {selectedDiscounts.length === discounts.length ? 'Deselect All' : 'Select All'}
              </button>

              {discounts.length === 0 ? (
                <p className="text-muted">No discounts found.</p>
              ) : (
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedDiscounts.length === discounts.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Product</th>
                      <th>Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(discount => (
                      <tr key={discount.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedDiscounts.includes(discount.id)}
                            onChange={(e) => handleSelectChange(discount.id, e.target.checked)}
                          />
                        </td>
                        <td>{discount.product_name}</td>
                        <td>
                          {discount.discount_percentage > 0
                            ? `${discount.discount_percentage}%`
                            : `$${discount.discount_amount.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={exporting || selectedDiscounts.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export Discounts'}
          </button>
          <a href="/products/discounts" className="btn btn-default">
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
