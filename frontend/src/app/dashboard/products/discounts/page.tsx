'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Discount {
  id: string;
  product_id: string;
  product_name: string;
  discount_percentage: number;
  discount_amount: number;
  start_date: string;
  end_date: string;
  status: string;
}

export default function ProductDiscountListPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async (discountId: string) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await api.delete(`/products/discounts/${discountId}`);
      setDiscounts(discounts.filter(d => d.id !== discountId));
    } catch (err) {
      console.error('Failed to delete discount:', err);
      setError('Failed to delete discount');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Discounts</h1>
          <p>
            <i className="fa fa-tag"></i> Manage product-level discounts.
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
          <Link href="/products/discounts/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Discount
          </Link>
          <Link href="/products/discounts/import" className="btn btn-default">
            <i className="fa fa-upload"></i> Import
          </Link>
          <Link href="/products/discounts/export" className="btn btn-default">
            <i className="fa fa-download"></i> Export
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading discounts...</p>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Product Discounts ({discounts.length})</h3>
              </div>
              <div className="panel-body">
                {discounts.length === 0 ? (
                  <p className="text-muted">No discounts defined.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Discount Type</th>
                        <th>Amount</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discounts.map(discount => (
                        <tr key={discount.id}>
                          <td>{discount.product_name}</td>
                          <td>
                            {Number(discount.discount_percentage) > 0 ? (
                              <span>{discount.discount_percentage}%</span>
                            ) : (
                              <span>${discount.discount_amount || '0'}</span>
                            )}
                          </td>
                          <td>
                            {Number(discount.discount_percentage) > 0
                              ? `${discount.discount_percentage}% off`
                              : `$${Number(discount.discount_amount || 0).toFixed(2)} off`}
                          </td>
                          <td>{discount.start_date}</td>
                          <td>{discount.end_date}</td>
                          <td>
                            <span className={`badge ${discount.status === 'active' ? 'badge-success' : ''}`}>
                              {discount.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              href={`/products/discounts/edit/${discount.id}`}
                              className="btn btn-sm btn-default"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(discount.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
