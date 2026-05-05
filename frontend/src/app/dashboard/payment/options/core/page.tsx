'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PaymentMethodOption {
  value: string;
  label: string;
}

export default function CorePaymentOptionsPage() {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paymentMembersOnly, setPaymentMembersOnly] = useState(false);
  const [paypalRedirectToPpx, setPaypalRedirectToPpx] = useState('n');
  const [methodOptions, setMethodOptions] = useState<PaymentMethodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/core');
      const data = res.data.data || {};
      const opts = res.data.payment_method_options || {};

      // Build method options list
      const optList: PaymentMethodOption[] = Object.entries(opts).map(([value, label]) => ({
        value,
        label: label as string,
      }));
      setMethodOptions(optList);

      // Parse current payment methods (comma-separated string)
      const methods = data.payment_methods
        ? data.payment_methods.split(',').map((m: string) => m.trim()).filter(Boolean)
        : [];
      setPaymentMethods(methods);

      // Parse members only checkbox
      const mo = (data.payment_members_only || '').toLowerCase();
      setPaymentMembersOnly(mo === 'y' || mo === '1' || mo === 'yes');

      // Parse paypal redirect
      setPaypalRedirectToPpx(data.paypal_redirect_to_ppx || 'n');
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to load options'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      const payload: Record<string, string> = {
        payment_methods: paymentMethods.join(','),
        payment_members_only: paymentMembersOnly ? 'y' : 'n',
        paypal_redirect_to_ppx: paypalRedirectToPpx,
      };
      await api.post('/payment/options/core', payload);
      setSuccess('Core payment options saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : (Array.isArray(d) ? d.map((x: any) => x.msg).join(', ') : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  // Check if both paypal and paypal_express are selected
  const showPaypalRedirect = paymentMethods.includes('paypal') && paymentMethods.includes('paypal_express');

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading payment options...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-credit-card" style={{ color: '#337ab7' }}></i> Core Payment Options</h1>
          <p className="text-muted">Configure the core payment processing settings for this store.</p>
        </div>
      </div>

      {error && (
        <div className="row"><div className="col-lg-12">
          <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>
        </div></div>
      )}
      {success && (
        <div className="row"><div className="col-lg-12">
          <div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div>
        </div></div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-9">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Options</h3>
              </div>
              <div className="panel-body">

                {/* Payment Methods - Multi-select */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Payment Methods
                  </label>
                  <select
                    multiple
                    className="form-control"
                    value={paymentMethods}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                      setPaymentMethods(selected);
                    }}
                    style={{ height: '220px', maxWidth: '400px' }}
                  >
                    {methodOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
                    Hold Ctrl (Cmd on Mac) to select multiple methods.
                  </small>
                </div>

                {/* Members Only - Checkbox */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <div className="checkbox">
                    <label style={{ fontWeight: 400 }}>
                      <input
                        type="checkbox"
                        checked={paymentMembersOnly}
                        onChange={(e) => setPaymentMembersOnly(e.target.checked)}
                      />
                      {' '}Members-Only Payment Methods
                    </label>
                  </div>
                  <small className="text-muted">
                    Only allow registered members to use payment methods other than credit card.
                  </small>
                </div>

                {/* PayPal Redirect - Conditional, only show when both paypal and paypal_express selected */}
                {showPaypalRedirect ? (
                  <div className="form-group" style={{ marginBottom: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                      PayPal Express Checkout Redirect
                    </label>
                    <small className="text-muted" style={{ display: 'block', marginBottom: '10px' }}>
                      When a customer selects PayPal as their payment method, redirect them to use PayPal Express Checkout instead.
                    </small>
                    <div className="radio" style={{ marginBottom: '4px' }}>
                      <label>
                        <input
                          type="radio"
                          name="paypal_redirect_to_ppx"
                          value="y"
                          checked={paypalRedirectToPpx.toLowerCase() === 'y'}
                          onChange={() => setPaypalRedirectToPpx('y')}
                        />
                        {' '}Yes
                      </label>
                    </div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          name="paypal_redirect_to_ppx"
                          value="n"
                          checked={paypalRedirectToPpx.toLowerCase() !== 'y'}
                          onChange={() => setPaypalRedirectToPpx('n')}
                        />
                        {' '}No
                      </label>
                    </div>
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-9">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
                {saving ? 'Saving...' : 'Save Payment Options'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
