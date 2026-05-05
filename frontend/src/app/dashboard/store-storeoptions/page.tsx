'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StoreResult {
  name: string;
  is_live: string;
  export_type: string;
  order_management: string;
  billing_type: string;
  shipping_type: string;
  ship_type: string;
  ship_calc: string;
  checkout_type: string;
  tax_api_calc: string;
  api_calc: string;
  inventory_control: string;
  cart_abandon: string;
  payment_methods: string;
}

export default function StoreOptionsPage() {
  const [stores, setStores] = useState<string[]>([]);
  const [storeResults, setStoreResults] = useState<StoreResult | null>(null);
  const [matchedStores, setMatchedStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search form state
  const [searchForm, setSearchForm] = useState<Record<string, string>>({});
  const [selectedStore, setSelectedStore] = useState('');

  const yesNoOptions = [{ value: '', label: '' }, { value: 'y', label: 'Yes' }, { value: 'n', label: 'No' }];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/storeoptions');
      setStores(res.data.stores || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load store options');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchForm({ ...searchForm, [field]: value });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setStoreResults(null);
    setMatchedStores([]);

    try {
      const res = await api.post('/stores/storeoptions/search', searchForm);
      setMatchedStores(res.data.stores || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleStoreSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    setSearching(true);
    setError(null);
    setMatchedStores([]);

    try {
      const res = await api.post('/stores/storeoptions/search', { store: selectedStore });
      if (res.data.store_details) {
        setStoreResults(res.data.store_details);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const renderSelect = (label: string, name: string, options: { value: string; label: string }[]) => (
    <tr key={name}>
      <td className="pull-right">{label}:</td>
      <td style={{ width: '5%' }}>&nbsp;</td>
      <td style={{ width: '55%' }}>
        <select
          className="form-control"
          value={searchForm[name] || ''}
          onChange={(e) => handleSearchChange(name, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Store Options</h1>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {/* Matched Stores List */}
      {matchedStores.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <div className="normaltext">Below is a list of stores matching your request</div>
            <ul>
              {matchedStores.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <hr />
          </div>
        </div>
      )}

      {/* Store Details Result */}
      {storeResults && (
        <div className="row">
          <div className="col-lg-12">
            <table style={{ width: '80%' }} className="text-center">
              <tbody>
                <tr><td className="pull-right">Store Name:</td><td>&nbsp;</td><td>{storeResults.name}</td></tr>
                <tr><td className="pull-right">Status:</td><td>&nbsp;</td><td>{storeResults.is_live}</td></tr>
                <tr><td className="pull-right">Order Export Type:</td><td>&nbsp;</td><td>{storeResults.export_type}</td></tr>
                <tr><td className="pull-right">Order Management:</td><td>&nbsp;</td><td>{storeResults.order_management}</td></tr>
                <tr><td className="pull-right">Billing Area:</td><td>&nbsp;</td><td>{storeResults.billing_type}</td></tr>
                <tr><td className="pull-right">Shipping Area:</td><td>&nbsp;</td><td>{storeResults.shipping_type}</td></tr>
                <tr><td className="pull-right">Shipping Type:</td><td>&nbsp;</td><td>{storeResults.ship_type}</td></tr>
                <tr><td className="pull-right">Shipping Calculated:</td><td>&nbsp;</td><td>{storeResults.ship_calc}</td></tr>
                <tr><td className="pull-right">Checkout Type:</td><td>&nbsp;</td><td>{storeResults.checkout_type}</td></tr>
                <tr><td className="pull-right">Uses Tax API:</td><td>&nbsp;</td><td>{storeResults.tax_api_calc}</td></tr>
                <tr><td className="pull-right">Uses Shipping API:</td><td>&nbsp;</td><td>{storeResults.api_calc}</td></tr>
                <tr><td className="pull-right">Uses Inventory Control:</td><td>&nbsp;</td><td>{storeResults.inventory_control}</td></tr>
                <tr><td className="pull-right">Uses Cart Abandonment:</td><td>&nbsp;</td><td>{storeResults.cart_abandon}</td></tr>
                <tr><td className="pull-right">Payment Methods Accepted:</td><td>&nbsp;</td><td>{storeResults.payment_methods}</td></tr>
              </tbody>
            </table>
            <hr />
          </div>
        </div>
      )}

      {/* Search Form */}
      <p><i className="fa fa-info-circle"></i> Select search criteria below. To ignore a particular setting, leave it blank when searching.</p>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSearch}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Store Options</h3>
              </div>
              <div className="panel-body">
                <table style={{ width: '80%' }}>
                  <tbody>
                    {renderSelect('Live', 'is_live', yesNoOptions)}
                    {renderSelect('Uses Tax API', 'tax_api_calc', yesNoOptions)}
                    {renderSelect('Uses Shipping API', 'api_calc', yesNoOptions)}
                    {renderSelect('Uses Inventory Control', 'inventory_control', yesNoOptions)}
                    {renderSelect('Uses Cart Abandonment', 'cart_abandon', yesNoOptions)}
                    {renderSelect('Uses Shipping Calculator', 'ship_calculator', yesNoOptions)}
                    {renderSelect('Uses Amazon Pay', 'amazon_pay', yesNoOptions)}
                    {renderSelect('Uses Address Verification', 'ship_address_confirm', yesNoOptions)}
                    {renderSelect('Uses Fractional Quantities', 'fractional_qty', yesNoOptions)}
                    {renderSelect('Uses Dimensional Shipping', 'dimensional_shipping', yesNoOptions)}
                    {renderSelect('Uses Suggested Search', 'use_suggested_search', yesNoOptions)}
                    {renderSelect('Uses Category Filters', 'use_category_filter', yesNoOptions)}
                    {renderSelect('Uses Mailchimp', 'mailchimp_enable', yesNoOptions)}
                    {renderSelect('Uses Interactive Pricing', 'interactive_pricing', yesNoOptions)}
                    {renderSelect('Uses Back-in-stock Notifications', 'product_notify', yesNoOptions)}
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>
                        <button type="submit" className="btn btn-primary" disabled={searching}>
                          {searching ? 'Searching...' : 'Search'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h1>Search By Store</h1>
            <p><i className="fa fa-info-circle"></i> To see the above results on a per-store basis, select the store from the list below.</p>
            <div className="text-center">
              <select
                className="form-control form-control-inline"
                style={{ width: '300px', display: 'inline-block' }}
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
              >
                <option value="">-- Select a Store --</option>
                {stores.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
              &nbsp;
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStoreSearch}
                disabled={searching}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
