'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TaxOptions {
  tax_on_shipping: boolean;
  tax_on_discounts: boolean;
  compound_tax: boolean;
  display_tax_in_catalog: boolean;
}

export default function TaxOptionsPage() {
  const [options, setOptions] = useState<TaxOptions>({
    tax_on_shipping: false,
    tax_on_discounts: false,
    compound_tax: false,
    display_tax_in_catalog: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/tax/options');
      setOptions(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.put('/tax/options', options);
      alert('Tax options saved successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save options');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Options</h1>
          <p><i className="fa fa-info-circle"></i> Configure general tax settings.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-6">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Tax Configuration</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label><input type="checkbox" name="tax_on_shipping" checked={options.tax_on_shipping} onChange={handleInputChange} /> Tax on Shipping</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="tax_on_discounts" checked={options.tax_on_discounts} onChange={handleInputChange} /> Tax on Discounts</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="compound_tax" checked={options.compound_tax} onChange={handleInputChange} /> Use Compound Tax</label>
                </div>

                <div className="form-group">
                  <label><input type="checkbox" name="display_tax_in_catalog" checked={options.display_tax_in_catalog} onChange={handleInputChange} /> Display Tax in Catalog</label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Options'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
