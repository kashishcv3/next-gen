'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

interface WishlistSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  state: string;
  zip: string;
}

interface WishlistProduct {
  product_id: string;
  name: string;
  qty_requested: number;
  qty_purchased: number;
  attributes?: string;
  [key: string]: any;
}

interface WishlistDetail {
  info: {
    id: string;
    first_name: string;
    last_name: string;
    city: string;
    state: string;
    zip: string;
    [key: string]: any;
  };
  products: WishlistProduct[];
}

const SITE_ID = 93;

export default function WishlistPage() {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<WishlistSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Detail view state
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [editedQtys, setEditedQtys] = useState<{ [key: string]: number }>({});
  const [savingDetail, setSavingDetail] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setSearchError('Please enter a last name or zip code');
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const res = await api.get('/customers/wishlists/search', {
        params: {
          site_id: SITE_ID,
          search: searchTerm,
        },
      });
      setSearchResults(res.data.data || []);
      if (res.data.data && res.data.data.length === 0) {
        setSearchError('No wishlists found matching your search.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to search wishlists';
      setSearchError(errorMsg);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleViewWishlist = async (wishlistId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    setEditedQtys({});
    setSaveMessage(null);

    try {
      const res = await api.get(`/customers/wishlists/${wishlistId}`, {
        params: { site_id: SITE_ID },
      });
      setSelectedWishlist(res.data);
      // Initialize edited quantities with current values
      const initialQtys: { [key: string]: number } = {};
      (res.data.products || []).forEach((product: WishlistProduct) => {
        initialQtys[product.product_id] = product.qty_purchased || 0;
      });
      setEditedQtys(initialQtys);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load wishlist details';
      setDetailError(errorMsg);
      setSelectedWishlist(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleQtyChange = (productId: string, value: number) => {
    setEditedQtys(prev => ({
      ...prev,
      [productId]: Math.max(0, value),
    }));
  };

  const handleSaveQtys = async () => {
    if (!selectedWishlist) return;

    setSavingDetail(true);
    setSaveMessage(null);

    try {
      const payload = {
        products: Object.entries(editedQtys).map(([productId, qty]) => ({
          product_id: productId,
          qty_purchased: qty,
        })),
      };

      await api.put(`/customers/wishlists/${selectedWishlist.info.id}`, payload, {
        params: { site_id: SITE_ID },
      });

      // Update the selected wishlist with new quantities
      setSelectedWishlist(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          products: prev.products.map(product => ({
            ...product,
            qty_purchased: editedQtys[product.product_id] || product.qty_purchased,
          })),
        };
      });

      setSaveMessage('Quantities saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save quantities';
      setSaveMessage(null);
      setDetailError(errorMsg);
    } finally {
      setSavingDetail(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedWishlist(null);
    setDetailError(null);
    setEditedQtys({});
    setSaveMessage(null);
  };

  // Detail view
  if (selectedWishlist && !detailLoading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="row">
          <div className="col-lg-12">
            <button
              className="btn btn-default btn-sm"
              onClick={handleBackToSearch}
              style={{ marginBottom: '15px' }}
            >
              <i className="fa fa-arrow-left"></i> Back to Search
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-heart" style={{ marginRight: '8px', color: '#d9534f' }}></i>
                  Wishlist Details
                </h3>
              </div>
              <div className="panel-body">
                {detailError && (
                  <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
                    <i className="fa fa-exclamation-circle"></i> {detailError}
                  </div>
                )}

                {saveMessage && (
                  <div className="alert alert-success" style={{ marginBottom: '15px' }}>
                    <i className="fa fa-check-circle"></i> {saveMessage}
                  </div>
                )}

                <div className="row" style={{ marginBottom: '20px' }}>
                  <div className="col-lg-12">
                    <h4 style={{ marginBottom: '15px' }}>
                      Registrant Information
                    </h4>
                    <div className="row">
                      <div className="col-lg-4">
                        <p style={{ marginBottom: '10px' }}>
                          <strong>Name:</strong>{' '}
                          {selectedWishlist.info.first_name} {selectedWishlist.info.last_name}
                        </p>
                      </div>
                      <div className="col-lg-4">
                        <p style={{ marginBottom: '10px' }}>
                          <strong>City:</strong> {selectedWishlist.info.city}
                        </p>
                      </div>
                      <div className="col-lg-4">
                        <p style={{ marginBottom: '10px' }}>
                          <strong>State:</strong> {selectedWishlist.info.state}
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-4">
                        <p>
                          <strong>Zip:</strong> {selectedWishlist.info.zip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                <h4 style={{ marginBottom: '15px' }}>Wishlist Items</h4>

                {selectedWishlist.products && selectedWishlist.products.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Attributes</th>
                          <th style={{ width: '120px' }}>Qty Requested</th>
                          <th style={{ width: '150px' }}>Qty Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWishlist.products.map(product => (
                          <tr key={product.product_id}>
                            <td>{product.name}</td>
                            <td>{product.attributes || '—'}</td>
                            <td style={{ textAlign: 'center' }}>{product.qty_requested}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                className="form-control"
                                style={{ width: '100%' }}
                                value={editedQtys[product.product_id] ?? product.qty_purchased}
                                onChange={e =>
                                  handleQtyChange(
                                    product.product_id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No items in this wishlist.</p>
                )}

                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveQtys}
                    disabled={savingDetail}
                  >
                    <i className="fa fa-save"></i>{' '}
                    {savingDetail ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="btn btn-default"
                    onClick={handleBackToSearch}
                    style={{ marginLeft: '10px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search view
  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>
            <i className="fa fa-heart" style={{ color: '#d9534f', marginRight: '8px' }}></i>
            Wishlists
          </h1>
          <p className="text-muted">
            Use this feature to search for customers&apos; wish lists.
          </p>
        </div>
      </div>

      <br />

      {searchError && !searching && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">
              <i className="fa fa-exclamation-circle"></i> {searchError}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSearch}>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Last Name or Zip Code"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={searching}
              />
              <span className="input-group-btn">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={searching}
                >
                  <i className="fa fa-search"></i>{' '}
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>

      {(searching || searchResults.length > 0) && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
                  Search Results
                </h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searching ? (
                      <tr>
                        <td colSpan={3} className="text-center" style={{ padding: '20px' }}>
                          <i className="fa fa-spinner fa-spin"></i> Loading...
                        </td>
                      </tr>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(result => (
                        <tr key={result.id}>
                          <td>
                            {result.first_name} {result.last_name}
                          </td>
                          <td>
                            {result.city}, {result.state} {result.zip}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-xs btn-info"
                              onClick={() => handleViewWishlist(result.id)}
                              disabled={detailLoading}
                            >
                              <i className="fa fa-eye"></i> View Wishlist
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center" style={{ padding: '30px' }}>
                          <i
                            className="fa fa-inbox fa-2x"
                            style={{ display: 'block', marginBottom: '10px', color: '#999' }}
                          ></i>
                          <span style={{ color: '#999' }}>No wishlists found.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info">
              <i className="fa fa-spinner fa-spin"></i> Loading wishlist details...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
