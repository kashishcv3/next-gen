'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      const res = await api.get('/customers/wishlists');
      setWishlists(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Customer Wishlists</h1>
          <p><i className="fa fa-info-circle"></i> View customer wish lists.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-heart"></i> Customer Wishlists</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Customer</th><th>Product Count</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {wishlists.length > 0 ? wishlists.map(wishlist => (
                      <tr key={wishlist.id}>
                        <td>{wishlist.customer_name}</td>
                        <td>{wishlist.product_count}</td>
                        <td>{new Date(wishlist.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-xs btn-info"><i className="fa fa-eye"></i> View</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center">No wishlists found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
