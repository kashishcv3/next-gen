'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function OrderDeletePage() {
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLookup = async () => {
    if (!orderId) {
      setError('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrderDetails(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Order not found');
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!orderId || !orderDetails) {
      setError('No order selected');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/orders/${orderId}`);
      setSuccess(true);
      setOrderId('');
      setOrderDetails(null);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError('Failed to delete order. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Order</h1>
      <p className="text-muted">Permanently delete an order from the system</p>
      <hr />

      <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        <strong>Warning!</strong> Deleting an order is permanent and cannot be undone. All associated data will be removed.
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Order deleted successfully!</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Delete Confirmation</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="orderId">Order ID</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter order ID to search"
                  />
                  <span className="input-group-btn">
                    <button
                      className="btn btn-default"
                      onClick={handleLookup}
                      disabled={loading || !orderId}
                    >
                      {loading ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i>
                        </>
                      ) : (
                        <>
                          <i className="fa fa-search"></i> Search
                        </>
                      )}
                    </button>
                  </span>
                </div>
              </div>

              {orderDetails && (
                <div className="alert alert-warning">
                  <h4>Order Details</h4>
                  <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                  <p><strong>Customer:</strong> {orderDetails.customer_name}</p>
                  <p><strong>Email:</strong> {orderDetails.customer_email}</p>
                  <p><strong>Total:</strong> ${parseFloat(orderDetails.total).toFixed(2)}</p>
                  <p><strong>Status:</strong> {orderDetails.status}</p>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i> Deleting...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-trash"></i> Confirm Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Important Information</h3>
            </div>
            <div className="panel-body">
              <h5>Before Deleting an Order:</h5>
              <ul>
                <li>Verify you are deleting the correct order</li>
                <li>Consider archiving instead of deleting for record keeping</li>
                <li>Check if the order has been shipped</li>
                <li>Ensure customer has been contacted if applicable</li>
                <li>Review any associated refunds or payments</li>
              </ul>

              <hr />

              <h5>Deletion Effects:</h5>
              <ul>
                <li>Order will be removed from all lists and searches</li>
                <li>All order items and details will be deleted</li>
                <li>Associated shipping information will be removed</li>
                <li>Payment records may remain for audit purposes</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
