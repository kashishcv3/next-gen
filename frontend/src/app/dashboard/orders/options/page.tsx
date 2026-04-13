'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderOptions {
  id: string;
  enable_fractional_quantities: boolean;
  enable_pgp_encryption: boolean;
  enable_recurring_orders: boolean;
  email_confirmation_customer: boolean;
  email_confirmation_vendor_bcc: string;
  enable_tracking_notifications: boolean;
  pdf_export_format: string;
  custom_api_key: string;
  require_approval: boolean;
  persistent_cart: boolean;
  reminder_service_enabled: boolean;
  reminder_days: number;
  gift_certificates_enabled: boolean;
}

export default function OrderOptionsPage() {
  const [options, setOptions] = useState<OrderOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/options');
      setOptions(response.data.data || getDefaultOptions());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch options:', err);
      setOptions(getDefaultOptions());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOptions = (): OrderOptions => ({
    id: '1',
    enable_fractional_quantities: false,
    enable_pgp_encryption: false,
    enable_recurring_orders: false,
    email_confirmation_customer: true,
    email_confirmation_vendor_bcc: '',
    enable_tracking_notifications: true,
    pdf_export_format: 'standard',
    custom_api_key: '',
    require_approval: false,
    persistent_cart: false,
    reminder_service_enabled: false,
    reminder_days: 7,
    gift_certificates_enabled: true,
  });

  const handleSave = async () => {
    if (!options) return;

    try {
      setLoading(true);
      await api.put('/orders/options', options);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setError(null);
    } catch (err) {
      console.error('Failed to save options:', err);
      setError('Failed to save options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (key: keyof OrderOptions, value: any) => {
    if (!options) return;
    setOptions({ ...options, [key]: value });
  };

  if (loading && !options) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading options...</div></div>;
  }

  if (!options) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-danger">Failed to load options</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Order Options & Settings</h1>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Settings saved successfully!</div>}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs" style={{ marginBottom: '20px' }}>
        <li className={activeTab === 'general' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('general'); }>
            General
          </a>
        </li>
        <li className={activeTab === 'quantities' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('quantities'); }>
            Quantities
          </a>
        </li>
        <li className={activeTab === 'security' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('security'); }>
            Security
          </a>
        </li>
        <li className={activeTab === 'recurring' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('recurring'); }>
            Recurring Orders
          </a>
        </li>
        <li className={activeTab === 'email' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('email'); }>
            Email
          </a>
        </li>
        <li className={activeTab === 'tracking' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('tracking'); }>
            Tracking
          </a>
        </li>
        <li className={activeTab === 'pdf' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('pdf'); }>
            PDF Export
          </a>
        </li>
        <li className={activeTab === 'member' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('member'); }>
            Member
          </a>
        </li>
        <li className={activeTab === 'reminder' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reminder'); }>
            Reminders
          </a>
        </li>
        <li className={activeTab === 'gc' ? 'active' : ''}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('gc'); }>
            Gift Certificates
          </a>
        </li>
      </ul>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">General Settings</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.persistent_cart}
                  onChange={(e) => updateOption('persistent_cart', e.target.checked)}
                />
                Enable Persistent Cart (retain items between sessions)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quantities Tab */}
      {activeTab === 'quantities' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Fractional Quantities</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.enable_fractional_quantities}
                  onChange={(e) => updateOption('enable_fractional_quantities', e.target.checked)}
                />
                Allow Fractional Quantities (e.g., 0.5, 2.75)
              </label>
              <p className="help-block">
                If enabled, customers can order fractional quantities of products.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">PGP Encryption</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.enable_pgp_encryption}
                  onChange={(e) => updateOption('enable_pgp_encryption', e.target.checked)}
                />
                Enable PGP Encryption for Order Data
              </label>
              <p className="help-block">
                If enabled, sensitive order information will be encrypted using PGP encryption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Orders Tab */}
      {activeTab === 'recurring' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Recurring Orders</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.enable_recurring_orders}
                  onChange={(e) => updateOption('enable_recurring_orders', e.target.checked)}
                />
                Enable Recurring/Subscription Orders
              </label>
              <p className="help-block">
                If enabled, customers can set up recurring orders with automatic billing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Email Confirmation</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.email_confirmation_customer}
                  onChange={(e) => updateOption('email_confirmation_customer', e.target.checked)}
                />
                Send Confirmation Email to Customer
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="vendorBcc">Vendor BCC Email Address</label>
              <input
                type="email"
                className="form-control"
                id="vendorBcc"
                value={options.email_confirmation_vendor_bcc}
                onChange={(e) => updateOption('email_confirmation_vendor_bcc', e.target.value)}
                placeholder="vendor@example.com"
              />
              <p className="help-block">
                BCC email address for order confirmations (leave blank to disable)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Tracking Notifications</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.enable_tracking_notifications}
                  onChange={(e) => updateOption('enable_tracking_notifications', e.target.checked)}
                />
                Enable Tracking Notifications
              </label>
              <p className="help-block">
                Send tracking information to customers when orders ship.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Tab */}
      {activeTab === 'pdf' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">PDF Export Settings</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="pdfFormat">Export Format</label>
              <select
                className="form-control"
                id="pdfFormat"
                value={options.pdf_export_format}
                onChange={(e) => updateOption('pdf_export_format', e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="invoice">Invoice</option>
                <option value="packing_slip">Packing Slip</option>
                <option value="shipping_label">Shipping Label</option>
              </select>
              <p className="help-block">
                Choose the default PDF format for order exports.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Member Tab */}
      {activeTab === 'member' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Member Section</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="apiKey">Custom API Key</label>
              <input
                type="text"
                className="form-control"
                id="apiKey"
                value={options.custom_api_key}
                onChange={(e) => updateOption('custom_api_key', e.target.value)}
                placeholder="Your custom API key"
              />
            </div>

            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.require_approval}
                  onChange={(e) => updateOption('require_approval', e.target.checked)}
                />
                Require Approval for Orders
              </label>
              <p className="help-block">
                If enabled, orders must be approved before processing.
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.persistent_cart}
                  onChange={(e) => updateOption('persistent_cart', e.target.checked)}
                />
                Enable Persistent Shopping Cart
              </label>
              <p className="help-block">
                Retain cart items between sessions for registered members.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Tab */}
      {activeTab === 'reminder' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Reminder Service</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.reminder_service_enabled}
                  onChange={(e) => updateOption('reminder_service_enabled', e.target.checked)}
                />
                Enable Reminder Service
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="reminderDays">Reminder Days</label>
              <input
                type="number"
                className="form-control"
                id="reminderDays"
                value={options.reminder_days}
                onChange={(e) => updateOption('reminder_days', parseInt(e.target.value))}
                min="1"
                max="365"
              />
              <p className="help-block">
                Number of days after order placement to send reminder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gift Certificates Tab */}
      {activeTab === 'gc' && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Gift Certificates</h3>
          </div>
          <div className="panel-body">
            <div className="form-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={options.gift_certificates_enabled}
                  onChange={(e) => updateOption('gift_certificates_enabled', e.target.checked)}
                />
                Enable Gift Certificates
              </label>
              <p className="help-block">
                If enabled, customers can purchase and redeem gift certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin"></i> Saving...
            </>
          ) : (
            <>
              <i className="fa fa-save"></i> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
