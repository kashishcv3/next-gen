'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * Set Order ID page.
 * Replicates old platform's store_setorderid.tpl exactly.
 */

export default function SetOrderIdPage() {
  const { siteId } = useStore();

  const [nextOrderId, setNextOrderId] = useState('');
  const [clearOrders, setClearOrders] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (siteId) fetchInfo();
  }, [siteId]);

  const fetchInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-settings/setorderid/${siteId}`);
      setCurrentOrderId(res.data.current_order_id || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load order ID info');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await api.post(`/store-settings/setorderid/${siteId}`, {
        nextorderid: nextOrderId,
        clearorders: clearOrders ? 'y' : 'n',
      });
      setSuccess(res.data.message || 'Order ID updated successfully');
      fetchInfo();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set order ID');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Set Order ID</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-7">
            <div className="form-group">
              <label>Next Order ID</label>
              <input
                type="text"
                className="form-control"
                name="nextorderid"
                value={nextOrderId}
                onChange={(e) => setNextOrderId(e.target.value)}
              />
              <label style={{ fontWeight: 'normal', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  name="clearorders"
                  checked={clearOrders}
                  onChange={(e) => setClearOrders(e.target.checked)}
                />{' '}
                clear out existing orders
              </label>
              <p className="help-block">
                <span className="label label-warning">Note</span> this should ONLY be done as a part of a site launch where there are NO REAL ORDERS!!!
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-7">
            <input
              type="submit"
              name="submit"
              value={saving ? 'Saving...' : 'Submit'}
              className="btn btn-primary"
              disabled={saving}
            />
          </div>
        </div>
      </form>
    </>
  );
}
