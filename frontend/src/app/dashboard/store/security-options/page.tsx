'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * Security Options page (option_type=security).
 * Replicates old platform's general_options.tpl (security section) exactly.
 * Panels: Form Verification, Restrict IPs, Email Validations, CSRF Prevention, Options, PCI Compliance.
 */

// Captcha form options (matches $options.forms in old platform)
const CAPTCHA_FORM_OPTIONS: Record<string, string> = {
  'contact_us': 'Contact Us',
  'tell_a_friend': 'Tell A Friend',
  'product_qa': 'Product Q&A',
  'create_account': 'Create Account',
  'checkout': 'Checkout',
};

// Captcha methods (matches $options.captcha_methods)
const CAPTCHA_METHODS: Record<string, string> = {
  '': 'None',
  '1': 'Image Captcha',
  '2': 'Math Captcha',
  '3': 'reCAPTCHA v2',
  '4': 'reCAPTCHA v3',
};

// Email validation form options
const EMAIL_VALIDATION_OPTIONS: Record<string, string> = {
  'checkout': 'Checkout',
  'create_account': 'Create Account',
  'contact_us': 'Contact Us',
};

// Consider invalid status options
const CONSIDER_INVALID_STATUS_OPTIONS: Record<string, string> = {
  'catch-all': 'Catch-All',
  'unknown': 'Unknown',
  'spamtrap': 'Spam Trap',
  'abuse': 'Abuse',
  'do_not_mail': 'Do Not Mail',
};

// CSRF action options (matches $options.actions)
const CSRF_ACTION_OPTIONS: Record<string, string> = {
  'checkout': 'Checkout',
  'create_account': 'Create Account',
  'login': 'Login',
  'contact_us': 'Contact Us',
  'tell_a_friend': 'Tell A Friend',
  'product_qa': 'Product Q&A',
};

export default function SecurityOptionsPage() {
  const { siteId } = useStore();

  const [info, setInfo] = useState<Record<string, any>>({});
  const [isBigadmin, setIsBigadmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (siteId) fetchOptions();
  }, [siteId]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-settings/security/${siteId}`);
      setInfo(res.data.info || {});
      setIsBigadmin(res.data.bigadmin === 'y');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load security options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setInfo({ ...info, [field]: value });
  };

  const handleMultiSelect = (field: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    handleChange(field, selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await api.post(`/store-settings/security/${siteId}`, {
        captcha_forms: info.captcha_forms || [],
        captcha_method: info.captcha_method || '',
        recaptcha_site_key: info.recaptcha_site_key || '',
        recaptcha_secret_key: info.recaptcha_secret_key || '',
        recaptcha_score: info.recaptcha_score || '',
        secure_logins: info.secure_logins || 'n',
        iframe_allow: info.iframe_allow || 'n',
        csrf_actions: info.csrf_actions || [],
        email_validation_pages: info.email_validation_pages || [],
        consider_invalid_status: info.consider_invalid_status || [],
        whitelisted_emails: info.whitelisted_emails || '',
        email_valid_retries: info.email_valid_retries || '',
        email_valid_error_message: info.email_valid_error_message || '',
        email_valid_api_key_general: info.email_valid_api_key_general || '',
        ip_from_0: info.ip_from_0 || '',
        ip_from_1: info.ip_from_1 || '',
        ip_from_2: info.ip_from_2 || '',
        ip_from_3: info.ip_from_3 || '',
        ip_from_4: info.ip_from_4 || '',
        ip_to_0: info.ip_to_0 || '',
        ip_to_1: info.ip_to_1 || '',
        ip_to_2: info.ip_to_2 || '',
        ip_to_3: info.ip_to_3 || '',
        ip_to_4: info.ip_to_4 || '',
        ip_0: info.ip_0 || '',
        ip_1: info.ip_1 || '',
        ip_2: info.ip_2 || '',
        ip_3: info.ip_3 || '',
        ip_4: info.ip_4 || '',
      });
      setSuccess('Security options saved');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save security options');
    } finally {
      setSaving(false);
    }
  };

  // Reusable Yes/No radio group
  const YesNoRadio = ({ name, value }: { name: string; value: string }) => (
    <>
      <label className="radio-inline">
        <input
          type="radio"
          name={name}
          value="y"
          checked={value === 'y'}
          onChange={() => handleChange(name, 'y')}
        />{' '}
        Yes
      </label>
      &nbsp;
      <label className="radio-inline">
        <input
          type="radio"
          name={name}
          value="n"
          checked={value !== 'y'}
          onChange={() => handleChange(name, 'n')}
        />{' '}
        No
      </label>
    </>
  );

  const showRecaptchaFields = info.captcha_method === '3' || info.captcha_method === '4';
  const showRecaptchaScore = info.captcha_method === '4';

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
          <h1>Security Options</h1>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form name="general_options" onSubmit={handleSubmit} role="form">

        {/* Form Verification Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Form Verification</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Enable Verification For the Following Forms (use Ctrl key to multiselect or unselect)</label>
                  <select
                    className="form-control"
                    name="captcha_forms[]"
                    size={6}
                    multiple
                    value={info.captcha_forms || []}
                    onChange={(e) => handleMultiSelect('captcha_forms', e)}
                  >
                    {Object.entries(CAPTCHA_FORM_OPTIONS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Verification Method</label>
                  <div>
                    {Object.entries(CAPTCHA_METHODS).map(([val, label]) => (
                      <label className="radio-inline" key={val}>
                        <input
                          type="radio"
                          name="captcha_method"
                          value={val}
                          checked={(info.captcha_method || '') === val}
                          onChange={() => handleChange('captcha_method', val)}
                        />{' '}
                        {label}
                      </label>
                    ))}
                  </div>
                  {showRecaptchaFields && (
                    <div style={{ marginTop: '10px' }}>
                      <p className="help-block">
                        Site Key and Secret Key fields must be unique per domain. They may be obtained from{' '}
                        <a href="https://www.google.com/recaptcha/admin#list" target="_blank" rel="noreferrer">
                          Google&apos;s reCAPTCHA site
                        </a>.
                      </p>
                      <div className="form-group">
                        <label>Site Key</label>
                        <input
                          type="text"
                          name="recaptcha_site_key"
                          className="form-control"
                          value={info.recaptcha_site_key || ''}
                          onChange={(e) => handleChange('recaptcha_site_key', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Secret Key</label>
                        <input
                          type="text"
                          name="recaptcha_secret_key"
                          className="form-control"
                          value={info.recaptcha_secret_key || ''}
                          onChange={(e) => handleChange('recaptcha_secret_key', e.target.value)}
                        />
                      </div>
                      {showRecaptchaScore && (
                        <div className="form-group">
                          <label>Rejection Score</label>
                          <input
                            type="text"
                            name="recaptcha_score"
                            className="form-control"
                            value={info.recaptcha_score || ''}
                            onChange={(e) => handleChange('recaptcha_score', e.target.value)}
                          />
                          <p className="help-block">
                            Reject successful responses based on a score range of 0.0 (likely a bot) to 1.0 (likely a valid customer). Leave blank to accept all successful responses.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="help-block">
                    reCAPTCHA v2 or above must be selected for Product Q&amp;A, Tell-a-Friend and reCAPTCHA v3 must be selected for Checkout Forms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restrict IPs Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Restrict IPs</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <a
                    href="#"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        `/dashboard/store/ip-restrictions/${siteId}`,
                        'iprestrictions',
                        'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,history=yes,width=350,height=500'
                      );
                    }}
                  >
                    Edit Current Restrictions
                  </a>
                </div>
                <div className="form-group">
                  <label>Add IP Range Restrictions</label>
                  <div className="well well-cv3-table">
                    <div className="table-responsive">
                      <table className="table table-hover table-striped cv3-data-table">
                        <thead>
                          <tr>
                            <th>From IP</th>
                            <th>To IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <tr key={`range_${i}`}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  name={`ip_from_${i}`}
                                  value={info[`ip_from_${i}`] || ''}
                                  onChange={(e) => handleChange(`ip_from_${i}`, e.target.value)}
                                  maxLength={15}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  name={`ip_to_${i}`}
                                  value={info[`ip_to_${i}`] || ''}
                                  onChange={(e) => handleChange(`ip_to_${i}`, e.target.value)}
                                  maxLength={15}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Add Single IP Restrictions</label>
                  <div className="well well-cv3-table">
                    <div className="table-responsive">
                      <table className="table table-hover table-striped cv3-data-table">
                        <thead>
                          <tr>
                            <th>IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <tr key={`single_${i}`}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  name={`ip_${i}`}
                                  value={info[`ip_${i}`] || ''}
                                  onChange={(e) => handleChange(`ip_${i}`, e.target.value)}
                                  maxLength={15}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Validations Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Email Validations</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Use custom zero bounce E-mail validation API key (If not, leave the field blank)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="email_valid_api_key_general"
                    value={info.email_valid_api_key_general || ''}
                    onChange={(e) => handleChange('email_valid_api_key_general', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Enable email validation for the following forms (use Ctrl key to multiselect or unselect)</label>
                  <select
                    className="form-control"
                    name="email_validation_pages[]"
                    multiple
                    value={info.email_validation_pages || []}
                    onChange={(e) => handleMultiSelect('email_validation_pages', e)}
                  >
                    {Object.entries(EMAIL_VALIDATION_OPTIONS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Consider these emails invalid along with the invalid status emails (use Ctrl key to multiselect or unselect)</label>
                  <select
                    className="form-control"
                    name="consider_invalid_status[]"
                    multiple
                    value={info.consider_invalid_status || []}
                    onChange={(e) => handleMultiSelect('consider_invalid_status', e)}
                  >
                    {Object.entries(CONSIDER_INVALID_STATUS_OPTIONS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Whitelist these emails. (Write each email in new line)</label>
                  <textarea
                    name="whitelisted_emails"
                    className="form-control"
                    rows={10}
                    value={info.whitelisted_emails || ''}
                    onChange={(e) => handleChange('whitelisted_emails', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Number of zero bounce failed validations allowed on placing orders until checkout is cancelled</label>
                  <input
                    type="number"
                    className="form-control"
                    name="email_valid_retries"
                    value={info.email_valid_retries || ''}
                    onChange={(e) => handleChange('email_valid_retries', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Custom error message for failed email validation on placing orders</label>
                  <input
                    type="text"
                    className="form-control"
                    name="email_valid_error_message"
                    value={info.email_valid_error_message || ''}
                    onChange={(e) => handleChange('email_valid_error_message', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSRF Prevention Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> CSRF Prevention</h3>
              </div>
              <div className="panel-body">
                <label>Enable CSRF Prevention for the following forms (use Ctrl key to multiselect or unselect)</label>
                <select
                  className="form-control"
                  name="csrf_actions[]"
                  size={6}
                  multiple
                  value={info.csrf_actions || []}
                  onChange={(e) => handleMultiSelect('csrf_actions', e)}
                >
                  {Object.entries(CSRF_ACTION_OPTIONS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Options</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Secure Member, Wholesale, And Affiliate Login Pages (make those pages https) - Do NOT turn this on if your entire site is https.</label>
                  <div>
                    <YesNoRadio name="secure_logins" value={info.secure_logins || 'n'} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Allow IFrame Display</label>
                  <div>
                    <YesNoRadio name="iframe_allow" value={info.iframe_allow || 'n'} />
                  </div>
                  <p className="help-block">
                    Allow external sites to display certain pages of your site in an IFrame.{' '}
                    <a href={`/dashboard/store/iframe-allow/${siteId}`}>Define Exceptions.</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PCI Compliance Panel (from store_security.tpl) */}
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Payment Card Industry (PCI) Compliance</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <p>
                    According to the PCI, we cannot save your CVV2 numbers on our server. If you would like to be able to download the CVV2 numbers you will have to override this setting.{' '}
                    <b>NOTE: If you select &quot;yes&quot; you will no longer be in compliance with the PCI.</b>
                  </p>
                  <label>Would you like to be able to download CVV2 numbers?</label>
                  <select
                    name="store_cvv2"
                    className="form-control"
                    style={{ width: '200px' }}
                    value={info.store_cvv2 || 'n'}
                    onChange={(e) => handleChange('store_cvv2', e.target.value)}
                  >
                    <option value="y">Yes</option>
                    <option value="n">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <input
          type="submit"
          value={saving ? 'Saving...' : 'Submit'}
          name="submit"
          className="btn btn-primary"
          disabled={saving}
        />
      </form>
    </>
  );
}
