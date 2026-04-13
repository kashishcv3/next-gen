'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CartItemRecord {
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface AbandonmentDetailData {
  customer_id: string;
  email: string;
  cart_total: number;
  items: CartItemRecord[];
  abandoned_date: string;
}

export default function CartAbandonmentDataPage() {
  const [data, setData] = useState<AbandonmentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/cart-abandonment/data');
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Cart Abandonment Items Detail</h1>
          <p>
            <i className="fa fa-info-circle"></i> View items in abandoned carts.
          </p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading cart items...</p>}

      {!loading && data && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <p><strong>Customer:</strong> {data.email}</p>
                <p><strong>Abandoned Date:</strong> {data.abandoned_date}</p>
                <p><strong>Cart Total:</strong> ${data.cart_total.toFixed(2)}</p>
              </div>
            </div>
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-center">Unit Price</th>
                      <th className="text-center">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.sku}</td>
                        <td>{item.product_name}</td>
                        <td align="center">{item.quantity}</td>
                        <td align="center">${item.unit_price.toFixed(2)}</td>
                        <td align="center">${item.line_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
