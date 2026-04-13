'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderRecord {
  date_ordered: string;
  order_id: string;
  source_code: string;
  sku: string;
  prod_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrdersData {
  orders: OrderRecord[];
  total_quantity: number;
  total_price: number;
  none?: string;
}

export default function OrdersPage() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.get('/reports/orders', {
        params: {
          startdate: startDate,
          enddate: endDate,
        },
      });
      setData(response.data.data);
      setSearched(true);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Order Detail</h1>
          <p>
            <i className="fa fa-info-circle"></i> Quickly view the order detail for your orders.
          </p>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSearch}>
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table cv3-data-table report-search">
                  <thead>
                    <tr>
                      <th className="text-center" colSpan={5}>
                        Search Date Range (mm/dd/yyyy)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td align="center">
                        From:
                        <br />
                        <input
                          type="text"
                          className="form-control form-control-inline"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          placeholder="MM/DD/YYYY"
                          size={10}
                        />
                      </td>
                      <td align="center">
                        To:
                        <br />
                        <input
                          type="text"
                          className="form-control form-control-inline"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          placeholder="MM/DD/YYYY"
                          size={10}
                        />
                      </td>
                      <td align="center" valign-bottom>
                        <br />
                        <button type="submit" className="btn btn-primary">
                          Search
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </form>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {loading && <p>Loading...</p>}

          {searched && data && (
            <>
              <div align="center">
                <b>
                  Results {startDate && endDate ? `from ${startDate} to ${endDate}` : ''}
                </b>
              </div>
              <div className="well well-cv3-table">
                <div className="table-responsive">
                  <table className="table table-hover table-striped cv3-data-table">
                    {data.none === 'y' ? (
                      <thead>
                        <tr>
                          <th className="text-center">
                            There were no results for your search
                          </th>
                        </tr>
                      </thead>
                    ) : (
                      <>
                        <thead>
                          <tr>
                            <th>Order Date</th>
                            <th className="text-center">Order Number</th>
                            <th className="text-center">Source</th>
                            <th className="text-center">SKU</th>
                            <th className="text-center">Product Name</th>
                            <th className="text-center">Qty</th>
                            <th className="text-center">Price</th>
                            <th className="text-center">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.orders.map((order, idx) => (
                            <tr key={idx}>
                              <td>{new Date(order.date_ordered).toLocaleDateString()}</td>
                              <td align="center">{order.order_id}</td>
                              <td align="center">{order.source_code}</td>
                              <td align="center">{order.sku}</td>
                              <td align="center">{order.prod_name}</td>
                              <td align="center">{order.quantity}</td>
                              <td align="center">${order.unit_price.toFixed(2)}</td>
                              <td align="center">${order.total_price.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td><b>Totals:</b></td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td align="center"><b>{data.total_quantity}</b></td>
                            <td>&nbsp;</td>
                            <td align="center"><b>${data.total_price.toFixed(2)}</b></td>
                          </tr>
                        </tbody>
                      </>
                    )}
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
