'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

const RadioYesNo = ({ name, value, onChange }: { name: string; value: string; onChange: (val: string) => void }) => (
  <span>
    <label className="radio-inline">
      <input type="radio" name={name} value="y" checked={value === 'y'} onChange={() => onChange('y')} /> Yes
    </label>
    &nbsp;
    <label className="radio-inline">
      <input type="radio" name={name} value="n" checked={value !== 'y'} onChange={() => onChange('n')} /> No
    </label>
  </span>
);

export default function OrderOptionsPage() {
  const [activeTab, setActiveTab] = useState('core');
  const [coreOptions, setCoreOptions] = useState<Record<string, string>>({});
  const [memberOptions, setMemberOptions] = useState<Record<string, string>>({});
  const [giftOptions, setGiftOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [coreRes, memberRes, giftRes] = await Promise.allSettled([
        api.get('/orders/options/core'),
        api.get('/orders/options/member'),
        api.get('/orders/options/gift'),
      ]);
      if (coreRes.status === 'fulfilled') setCoreOptions(coreRes.value.data.data || {});
      if (memberRes.status === 'fulfilled') setMemberOptions(memberRes.value.data.data || {});
      if (giftRes.status === 'fulfilled') setGiftOptions(giftRes.value.data.data || {});
    } catch (err) {
      console.error('Failed to load options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      if (activeTab === 'core') {
        await api.post('/orders/options/core', coreOptions);
      } else if (activeTab === 'member') {
        await api.post('/orders/options/member', memberOptions);
      } else if (activeTab === 'gift') {
        await api.post('/orders/options/gift', giftOptions);
      }
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Failed to save options');
    }
  };

  const updateCore = (key: string, value: string) => setCoreOptions(prev => ({ ...prev, [key]: value }));
  const updateMember = (key: string, value: string) => setMemberOptions(prev => ({ ...prev, [key]: value }));
  const updateGift = (key: string, value: string) => setGiftOptions(prev => ({ ...prev, [key]: value }));

  const tabNames: Record<string, string> = {
    core: 'General',
    member: 'Member',
    gift: 'Gift Certificates',
  };

  if (loading) return <><h1>Order Options &amp; Settings</h1><p><i className="fa fa-spinner fa-spin"></i> Loading...</p></>;

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>{tabNames[activeTab] || 'Order Options & Settings'}</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tab Navigation — maps to option_type in old platform */}
      <ul className="nav nav-tabs" style={{ marginBottom: '20px' }}>
        {Object.entries(tabNames).map(([key, label]) => (
          <li key={key} className={activeTab === key ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(key); }}>{label}</a>
          </li>
        ))}
      </ul>

      <form name="order_options" method="post" onSubmit={handleSave} role="form">

        {/* ===== CORE OPTIONS ===== */}
        {activeTab === 'core' && (
          <>
            {/* Options Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable Fractional Quantities</label>
                      <br />
                      <RadioYesNo name="fractional_qty" value={coreOptions.fractional_qty || 'n'} onChange={(v) => updateCore('fractional_qty', v)} />
                      <p className="help-block">Product quantities will be purchased and exported in decimal format.</p>
                    </div>
                    <div className="form-group">
                      <label>Encrypt Order Export with PGP</label>
                      <br />
                      <RadioYesNo name="encrypt_orders" value={coreOptions.encrypt_orders || 'n'} onChange={(v) => updateCore('encrypt_orders', v)} />
                    </div>
                    <div className="form-group">
                      <label>Recurring Orders</label>
                      <br />
                      <label className="radio-inline">
                        <input type="radio" name="recurring_orders_by_product" value="product"
                          checked={coreOptions.recurring_orders_by_product === 'product'}
                          onChange={() => updateCore('recurring_orders_by_product', 'product')} /> By Product
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="recurring_orders_by_product" value="order"
                          checked={coreOptions.recurring_orders_by_product !== 'product'}
                          onChange={() => updateCore('recurring_orders_by_product', 'order')} /> By Order
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Email Confirmation</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Send Email Confirmation to Customers</label>
                      <br />
                      <RadioYesNo name="email_conf_customers" value={coreOptions.email_conf_customers || 'n'} onChange={(v) => updateCore('email_conf_customers', v)} />
                    </div>
                    <div className="form-group">
                      <label>Bcc for Email Confirmation to Customers</label>
                      <input type="text" className="form-control" name="email_conf_bcc"
                        value={coreOptions.email_conf_bcc || ''}
                        onChange={(e) => updateCore('email_conf_bcc', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Bcc for Email Confirmation to Vendor</label>
                      <input type="text" className="form-control" name="email_vendor_bcc"
                        value={coreOptions.email_vendor_bcc || ''}
                        onChange={(e) => updateCore('email_vendor_bcc', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Send copy of email confirmation to store owner</label>
                      <br />
                      <RadioYesNo name="email_conf_storeowner" value={coreOptions.email_conf_storeowner || 'n'} onChange={(v) => updateCore('email_conf_storeowner', v)} />
                      <p className="help-block"><span className="label label-warning">Note</span> This is a separate option than the bcc field above - using both for the same email address will result in 2 emails.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking/Status Notifications Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Tracking/Status Notifications</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Notify Customer of Tracking and Status Updates</label>
                      <br />
                      <RadioYesNo name="tracking_notify" value={coreOptions.tracking_notify || 'n'} onChange={(v) => updateCore('tracking_notify', v)} />
                    </div>
                    <div className="form-group">
                      <label>Email Subject</label>
                      <input type="text" className="form-control" name="tracking_notify_subject"
                        value={coreOptions.tracking_notify_subject || ''}
                        onChange={(e) => updateCore('tracking_notify_subject', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Email From Address</label>
                      <input type="text" className="form-control" name="tracking_notify_from"
                        value={coreOptions.tracking_notify_from || ''}
                        onChange={(e) => updateCore('tracking_notify_from', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Bcc for Tracking/Status Notification to Customers</label>
                      <input type="text" className="form-control" name="tracking_notify_bcc"
                        value={coreOptions.tracking_notify_bcc || ''}
                        onChange={(e) => updateCore('tracking_notify_bcc', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Order Export Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> PDF Order Export</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Export Credit Card and Price Information</label>
                      <br />
                      <RadioYesNo name="orderpdf_print_ccinfo" value={coreOptions.orderpdf_print_ccinfo || 'n'} onChange={(v) => updateCore('orderpdf_print_ccinfo', v)} />
                    </div>
                    <div className="form-group">
                      <label>Export Full Credit Card Numbers</label>
                      <br />
                      <RadioYesNo name="orderpdf_print_ccnum" value={coreOptions.orderpdf_print_ccnum || 'n'} onChange={(v) => updateCore('orderpdf_print_ccnum', v)} />
                    </div>
                    <div className="form-group">
                      <label>Print One Ship-To Per Page</label>
                      <br />
                      <RadioYesNo name="orderpdf_separate_shiptos" value={coreOptions.orderpdf_separate_shiptos || 'n'} onChange={(v) => updateCore('orderpdf_separate_shiptos', v)} />
                    </div>
                    <div className="form-group">
                      <label>Order ID Prefix</label>
                      <input type="text" className="form-control" name="pdf_order_prefix"
                        value={coreOptions.pdf_order_prefix || ''}
                        onChange={(e) => updateCore('pdf_order_prefix', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== MEMBER OPTIONS ===== */}
        {activeTab === 'member' && (
          <>
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Service</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Use Custom Member API</label>
                      <br />
                      <RadioYesNo name="custom_member_api" value={memberOptions.custom_member_api || 'n'} onChange={(v) => updateMember('custom_member_api', v)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {memberOptions.custom_member_api === 'y' && (
              <div className="row">
                <div className="col-lg-12">
                  <div className="panel panel-primary">
                    <div className="panel-heading">
                      <h3 className="panel-title"><i className="fa fa-cogs"></i> Custom API Options</h3>
                    </div>
                    <div className="panel-body">
                      <div className="form-group">
                        <label>External Service URL</label>
                        <input className="form-control" type="text" name="custom_member_api_url"
                          value={memberOptions.custom_member_api_url || ''}
                          onChange={(e) => updateMember('custom_member_api_url', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>External Service API Key</label>
                        <input className="form-control" type="text" name="custom_member_api_key"
                          value={memberOptions.custom_member_api_key || ''}
                          onChange={(e) => updateMember('custom_member_api_key', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>External Service Key ID</label>
                        <input className="form-control" type="text" name="custom_member_api_keyid"
                          value={memberOptions.custom_member_api_keyid || ''}
                          onChange={(e) => updateMember('custom_member_api_keyid', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Member Options</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Member Approval</label>
                      <br />
                      <RadioYesNo name="member_approval" value={memberOptions.member_approval || 'n'} onChange={(v) => updateMember('member_approval', v)} />
                    </div>
                    <div className="form-group">
                      <label>Persistent Cart</label>
                      <br />
                      <RadioYesNo name="persistent_cart" value={memberOptions.persistent_cart || 'n'} onChange={(v) => updateMember('persistent_cart', v)} />
                    </div>
                    <div className="form-group">
                      <label>Send Birthday Email</label>
                      <br />
                      <RadioYesNo name="birthday_email" value={memberOptions.birthday_email || 'n'} onChange={(v) => updateMember('birthday_email', v)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== GIFT CERTIFICATE OPTIONS ===== */}
        {activeTab === 'gift' && (
          <>
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cogs"></i> Gift Certificate Options</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Delay Sending of Gift Certificate Codes</label>
                      <br />
                      <RadioYesNo name="gcv_delay" value={giftOptions.gcv_delay || 'n'} onChange={(v) => updateGift('gcv_delay', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Service Fee Amount</label>
                      <input type="text" className="form-control" name="gcv_fee"
                        value={giftOptions.gcv_fee || ''}
                        onChange={(e) => updateGift('gcv_fee', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Shipping</label>
                      <br />
                      <RadioYesNo name="gcv_shipping" value={giftOptions.gcv_shipping || 'n'} onChange={(v) => updateGift('gcv_shipping', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Tax</label>
                      <br />
                      <RadioYesNo name="gcv_tax" value={giftOptions.gcv_tax || 'n'} onChange={(v) => updateGift('gcv_tax', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Promos</label>
                      <br />
                      <RadioYesNo name="gcv_promos" value={giftOptions.gcv_promos || 'n'} onChange={(v) => updateGift('gcv_promos', v)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <input type="submit" value="Submit" name="submit" className="btn btn-primary" />
      </form>
    </>
  );
}
