'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderCreditPage() {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !amount || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/orders/credit', {
        order_id: orderId,
        amount: parseFloat(amount),
        reason: reason,
      });
      setSuccess(true);
      setOrderId('');
      setAmount('');
      setReason('');
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to process credit:', err);
      setError('Failed to process credit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Credit</h1>
      <p className="text-muted">Issue a credit to an order</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Credit issued successfully!</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Credit Payment Form</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="orderId">Order ID *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter order ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Credit Amount ($) *</label>
                  <div className="input-group">
                    <span className="input-group-addon">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Credit *</label>
                  <select
                    className="form-control"
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="damaged">Item Damaged</option>
                    <option value="wrong_item">Wrong Item Shipped</option>
                    <option value="partial_return">Partial Return</option>
                    <option value="customer_courtesy">Customer Courtesy</option>
                    <option value="price_adjustment">Price Adjustment</option>
                    <option value="defective">Defective Product</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin"></i> Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-credit-card"></i> Issue Credit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Information</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Credit Processing:</strong> Issue credits to customer orders for refunds, adjustments, or courtesy.
              </p>
              <p>
                <strong>Required Fields:</strong>
              </p>
              <ul>
                <li>Order ID - the unique order identifier</li>
                <li>Credit Amount - the dollar amount to credit</li>
                <li>Reason - the reason for issuing the credit</li>
              </ul>
              <p>
                <strong>Impact:</strong> Credits are immediately applied to the order and customer account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
