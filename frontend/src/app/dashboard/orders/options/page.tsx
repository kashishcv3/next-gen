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

const MEMBER_REQUIRED_FIELD_OPTIONS = [
  { value: 'company', label: 'Company' },
  { value: 'address2', label: 'Address 2' },
  { value: 'phone', label: 'Phone' },
  { value: 'fax', label: 'Fax' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'gender', label: 'Gender' },
];

const PDF_CUSTOM_FIELD_OPTIONS = [
  { value: 'custom1', label: 'Custom Field 1' },
  { value: 'custom2', label: 'Custom Field 2' },
  { value: 'custom3', label: 'Custom Field 3' },
  { value: 'custom4', label: 'Custom Field 4' },
  { value: 'custom5', label: 'Custom Field 5' },
  { value: 'custom6', label: 'Custom Field 6' },
  { value: 'custom7', label: 'Custom Field 7' },
  { value: 'custom8', label: 'Custom Field 8' },
  { value: 'custom9', label: 'Custom Field 9' },
  { value: 'custom10', label: 'Custom Field 10' },
];

export default function OrderOptionsPage() {
  const [activeTab, setActiveTab] = useState('core');
  const [coreOptions, setCoreOptions] = useState<Record<string, string>>({});
  const [memberOptions, setMemberOptions] = useState<Record<string, string>>({});
  const [giftOptions, setGiftOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    setError(null); setSuccess(null); setSaving(true);
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
    } finally {
      setSaving(false);
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

  // Parse multi-select values (comma-separated)
  const parseCsv = (val: string) => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  const toCsv = (arr: string[]) => arr.join(',');

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Options &amp; Settings</h1>
      <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1><i className="fa fa-cogs" style={{ color: '#337ab7' }}></i> {tabNames[activeTab] || 'Order Options & Settings'}</h1>
        </div>
      </div>

      {error && <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {success}</div>}

      {/* Tab Navigation */}
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

                    {coreOptions.encrypt_orders === 'y' && (
                      <>
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                          <label>Encryption Status</label>
                          <input type="text" className="form-control" name="encrypt_orders_status"
                            value={coreOptions.encrypt_orders_status || ''}
                            onChange={(e) => updateCore('encrypt_orders_status', e.target.value)}
                            readOnly
                            style={{ maxWidth: '400px' }}
                          />
                          <p className="help-block">Current encryption setup status.</p>
                        </div>
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                          <label>PGP Public Key</label>
                          <textarea className="form-control" name="encrypt_orders_key" rows={6}
                            value={coreOptions.encrypt_orders_key || ''}
                            onChange={(e) => updateCore('encrypt_orders_key', e.target.value)}
                            style={{ maxWidth: '600px', fontFamily: 'monospace', fontSize: '12px' }}
                          />
                          <p className="help-block">Paste your PGP public key here.</p>
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>Recurring Orders</label>
                      <br />
                      <label className="radio-inline">
                        <input type="radio" name="recurring_orders_by_product" value="y"
                          checked={coreOptions.recurring_orders_by_product === 'y'}
                          onChange={() => updateCore('recurring_orders_by_product', 'y')} /> By Product
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="recurring_orders_by_product" value="n"
                          checked={coreOptions.recurring_orders_by_product !== 'y'}
                          onChange={() => updateCore('recurring_orders_by_product', 'n')} /> By Order
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
                    <h3 className="panel-title"><i className="fa fa-envelope"></i> Email Confirmation</h3>
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
                    <h3 className="panel-title"><i className="fa fa-truck"></i> Tracking/Status Notifications</h3>
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
                    <h3 className="panel-title"><i className="fa fa-file-pdf-o"></i> PDF Order Export</h3>
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
                      <label>Custom Fields to Include in PDF Export</label>
                      <select
                        multiple
                        className="form-control"
                        value={parseCsv(coreOptions.pdf_cust || '')}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                          updateCore('pdf_cust', toCsv(selected));
                        }}
                        style={{ height: '160px', maxWidth: '300px' }}
                      >
                        {PDF_CUSTOM_FIELD_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
                        Hold Ctrl (Cmd on Mac) to select multiple fields.
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Order ID Prefix</label>
                      <input type="text" className="form-control" name="pdf_order_prefix"
                        value={coreOptions.pdf_order_prefix || ''}
                        onChange={(e) => updateCore('pdf_order_prefix', e.target.value)}
                        style={{ maxWidth: '200px' }}
                      />
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
            {/* Custom Member API Service Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-cloud"></i> Service</h3>
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
                      <h3 className="panel-title"><i className="fa fa-plug"></i> Custom API Options</h3>
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
                      <div className="form-group">
                        <label>Protocol</label>
                        <br />
                        <label className="radio-inline">
                          <input type="radio" name="custom_member_api_protocol" value="https"
                            checked={(memberOptions.custom_member_api_protocol || 'https') === 'https'}
                            onChange={() => updateMember('custom_member_api_protocol', 'https')} /> HTTPS
                        </label>
                        &nbsp;
                        <label className="radio-inline">
                          <input type="radio" name="custom_member_api_protocol" value="http"
                            checked={memberOptions.custom_member_api_protocol === 'http'}
                            onChange={() => updateMember('custom_member_api_protocol', 'http')} /> HTTP
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Format</label>
                        <br />
                        <label className="radio-inline">
                          <input type="radio" name="custom_member_api_format" value="json"
                            checked={(memberOptions.custom_member_api_format || 'json') === 'json'}
                            onChange={() => updateMember('custom_member_api_format', 'json')} /> JSON
                        </label>
                        &nbsp;
                        <label className="radio-inline">
                          <input type="radio" name="custom_member_api_format" value="xml"
                            checked={memberOptions.custom_member_api_format === 'xml'}
                            onChange={() => updateMember('custom_member_api_format', 'xml')} /> XML
                        </label>
                        &nbsp;
                        <label className="radio-inline">
                          <input type="radio" name="custom_member_api_format" value="post"
                            checked={memberOptions.custom_member_api_format === 'post'}
                            onChange={() => updateMember('custom_member_api_format', 'post')} /> POST
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Wishlist Sync</label>
                        <br />
                        <RadioYesNo name="custom_member_api_wishlist" value={memberOptions.custom_member_api_wishlist || 'n'} onChange={(v) => updateMember('custom_member_api_wishlist', v)} />
                      </div>
                      <div className="form-group">
                        <label>Cart Sync</label>
                        <br />
                        <RadioYesNo name="custom_member_api_cart" value={memberOptions.custom_member_api_cart || 'n'} onChange={(v) => updateMember('custom_member_api_cart', v)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Member Options Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-users"></i> Member Options</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Member Approval</label>
                      <br />
                      <RadioYesNo name="member_approve" value={memberOptions.member_approve || 'n'} onChange={(v) => updateMember('member_approve', v)} />
                      <p className="help-block">Require admin approval before new members can access their account.</p>
                    </div>

                    {memberOptions.member_approve === 'y' && (
                      <>
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                          <label>Approval Notification To (Email)</label>
                          <input type="text" className="form-control" name="member_approve_to"
                            value={memberOptions.member_approve_to || ''}
                            onChange={(e) => updateMember('member_approve_to', e.target.value)} />
                          <p className="help-block">Email address to receive member approval requests.</p>
                        </div>
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                          <label>Approval Notification From (Email)</label>
                          <input type="text" className="form-control" name="member_approve_from"
                            value={memberOptions.member_approve_from || ''}
                            onChange={(e) => updateMember('member_approve_from', e.target.value)} />
                          <p className="help-block">From address for member approval notification emails.</p>
                        </div>
                      </>
                    )}

                    <div className="form-group">
                      <label>Send Email Confirmation to New Members</label>
                      <br />
                      <RadioYesNo name="member_email_conf" value={memberOptions.member_email_conf || 'n'} onChange={(v) => updateMember('member_email_conf', v)} />
                    </div>
                    <div className="form-group">
                      <label>More Member Email Alerts</label>
                      <br />
                      <RadioYesNo name="more_member_email_alerts" value={memberOptions.more_member_email_alerts || 'n'} onChange={(v) => updateMember('more_member_email_alerts', v)} />
                    </div>
                    <div className="form-group">
                      <label>Persistent Cart</label>
                      <br />
                      <RadioYesNo name="member_persistent_cart" value={memberOptions.member_persistent_cart || 'n'} onChange={(v) => updateMember('member_persistent_cart', v)} />
                      <p className="help-block">Save the cart contents when a member logs out and restore when they log back in.</p>
                    </div>

                    {memberOptions.member_persistent_cart === 'y' && (
                      <div className="form-group" style={{ marginLeft: '20px' }}>
                        <label>Exclude Promo Items from Persistent Cart</label>
                        <br />
                        <RadioYesNo name="member_persistent_cart_exclude_promos" value={memberOptions.member_persistent_cart_exclude_promos || 'n'} onChange={(v) => updateMember('member_persistent_cart_exclude_promos', v)} />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Clear Cart Confirmation</label>
                      <br />
                      <RadioYesNo name="member_cart_clear_confirm" value={memberOptions.member_cart_clear_confirm || 'n'} onChange={(v) => updateMember('member_cart_clear_confirm', v)} />
                      <p className="help-block">Prompt customers before clearing their cart.</p>
                    </div>
                    <div className="form-group">
                      <label>Require Zip Code for Wishlist</label>
                      <br />
                      <RadioYesNo name="member_wishlist_require_zip" value={memberOptions.member_wishlist_require_zip || 'n'} onChange={(v) => updateMember('member_wishlist_require_zip', v)} />
                    </div>
                    <div className="form-group">
                      <label>Member Incentive Login</label>
                      <br />
                      <RadioYesNo name="member_incentive_login" value={memberOptions.member_incentive_login || 'n'} onChange={(v) => updateMember('member_incentive_login', v)} />
                      <p className="help-block">Prompt guests to login or register during checkout to receive member pricing.</p>
                    </div>
                    <div className="form-group">
                      <label>Required Registration Fields</label>
                      <select
                        multiple
                        className="form-control"
                        value={parseCsv(memberOptions.member_required_fields || '')}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                          updateMember('member_required_fields', toCsv(selected));
                        }}
                        style={{ height: '140px', maxWidth: '300px' }}
                      >
                        {MEMBER_REQUIRED_FIELD_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
                        Hold Ctrl (Cmd on Mac) to select multiple fields.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Info Change Notification Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-bell"></i> Billing Info Change Notification</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Send Notification on Billing Info Change</label>
                      <br />
                      <RadioYesNo name="member_change_notify" value={memberOptions.member_change_notify || 'n'} onChange={(v) => updateMember('member_change_notify', v)} />
                    </div>

                    {memberOptions.member_change_notify === 'y' && (
                      <>
                        <div className="form-group">
                          <label>Notification Email Address</label>
                          <input type="text" className="form-control" name="member_change_notify_email"
                            value={memberOptions.member_change_notify_email || ''}
                            onChange={(e) => updateMember('member_change_notify_email', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Notification Email Subject</label>
                          <input type="text" className="form-control" name="member_change_notify_subject"
                            value={memberOptions.member_change_notify_subject || ''}
                            onChange={(e) => updateMember('member_change_notify_subject', e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Birthday Email Panel */}
            <div className="row">
              <div className="col-lg-12">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title"><i className="fa fa-birthday-cake"></i> Birthday Email</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Send Birthday Email</label>
                      <br />
                      <RadioYesNo name="member_birthday_email" value={memberOptions.member_birthday_email || 'n'} onChange={(v) => updateMember('member_birthday_email', v)} />
                    </div>

                    {memberOptions.member_birthday_email === 'y' && (
                      <>
                        <div className="form-group">
                          <label>Birthday Email From Address</label>
                          <input type="text" className="form-control" name="member_birthday_from_email"
                            value={memberOptions.member_birthday_from_email || ''}
                            onChange={(e) => updateMember('member_birthday_from_email', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Birthday Email Subject</label>
                          <input type="text" className="form-control" name="member_birthday_subject"
                            value={memberOptions.member_birthday_subject || ''}
                            onChange={(e) => updateMember('member_birthday_subject', e.target.value)} />
                        </div>
                      </>
                    )}
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
                    <h3 className="panel-title"><i className="fa fa-gift"></i> Gift Certificate Options</h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Delay Sending of Gift Certificate Codes</label>
                      <br />
                      <RadioYesNo name="gift_certificate_delay" value={giftOptions.gift_certificate_delay || 'n'} onChange={(v) => updateGift('gift_certificate_delay', v)} />
                      <p className="help-block">Hold gift certificate codes until the order is marked as shipped or complete.</p>
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Service Fee Type</label>
                      <br />
                      <label className="radio-inline">
                        <input type="radio" name="gift_certificate_fee_type" value="flat"
                          checked={(giftOptions.gift_certificate_fee_type || 'flat') === 'flat'}
                          onChange={() => updateGift('gift_certificate_fee_type', 'flat')} /> Flat
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="gift_certificate_fee_type" value="percent"
                          checked={giftOptions.gift_certificate_fee_type === 'percent'}
                          onChange={() => updateGift('gift_certificate_fee_type', 'percent')} /> Percent
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Service Fee Amount</label>
                      <input type="text" className="form-control" name="gift_certificate_fee_amount"
                        value={giftOptions.gift_certificate_fee_amount || ''}
                        onChange={(e) => updateGift('gift_certificate_fee_amount', e.target.value)}
                        style={{ maxWidth: '200px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Shipping</label>
                      <br />
                      <RadioYesNo name="gift_certificate_shipping" value={giftOptions.gift_certificate_shipping || 'n'} onChange={(v) => updateGift('gift_certificate_shipping', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Tax</label>
                      <br />
                      <RadioYesNo name="gift_certificate_tax" value={giftOptions.gift_certificate_tax || 'n'} onChange={(v) => updateGift('gift_certificate_tax', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Can Apply to Promos</label>
                      <br />
                      <RadioYesNo name="gift_certificate_promos" value={giftOptions.gift_certificate_promos || 'n'} onChange={(v) => updateGift('gift_certificate_promos', v)} />
                    </div>
                    <div className="form-group">
                      <label>Gift Certificate Type</label>
                      <br />
                      <label className="radio-inline">
                        <input type="radio" name="gift_certificate_internal_external" value="internal"
                          checked={(giftOptions.gift_certificate_internal_external || 'internal') === 'internal'}
                          onChange={() => updateGift('gift_certificate_internal_external', 'internal')} /> Internal
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="gift_certificate_internal_external" value="external"
                          checked={giftOptions.gift_certificate_internal_external === 'external'}
                          onChange={() => updateGift('gift_certificate_internal_external', 'external')} /> External
                      </label>
                      &nbsp;
                      <label className="radio-inline">
                        <input type="radio" name="gift_certificate_internal_external" value="both"
                          checked={giftOptions.gift_certificate_internal_external === 'both'}
                          onChange={() => updateGift('gift_certificate_internal_external', 'both')} /> Both
                      </label>
                    </div>

                    {(giftOptions.gift_certificate_internal_external === 'internal' || giftOptions.gift_certificate_internal_external === 'both' || !giftOptions.gift_certificate_internal_external) && (
                      <div className="form-group">
                        <label>Internal Gift Certificate Name</label>
                        <input type="text" className="form-control" name="gift_certificate_internal_name"
                          value={giftOptions.gift_certificate_internal_name || ''}
                          onChange={(e) => updateGift('gift_certificate_internal_name', e.target.value)}
                          style={{ maxWidth: '400px' }}
                        />
                        <p className="help-block">Display name for internally managed gift certificates.</p>
                      </div>
                    )}

                    {(giftOptions.gift_certificate_internal_external === 'external' || giftOptions.gift_certificate_internal_external === 'both') && (
                      <div className="form-group">
                        <label>External Gift Certificate Name</label>
                        <input type="text" className="form-control" name="gift_certificate_external_name"
                          value={giftOptions.gift_certificate_external_name || ''}
                          onChange={(e) => updateGift('gift_certificate_external_name', e.target.value)}
                          style={{ maxWidth: '400px' }}
                        />
                        <p className="help-block">Display name for externally managed gift certificates.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="row">
          <div className="col-lg-12">
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
