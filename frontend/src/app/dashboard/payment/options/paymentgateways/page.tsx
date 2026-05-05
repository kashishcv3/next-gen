'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface GatewayDefinition {
  name: string;
  username?: string;
  password?: string;
  auth?: Record<string, string>;
  environment?: Record<string, string>;
  service_location?: Record<string, string>;
  platform?: Record<string, string>;
  currency?: Record<string, string>;
  request_type?: Record<string, string>;
  version?: Record<string, string>;
  terminal?: string;
  merchant_id?: string;
  partner?: string;
  security_key?: string;
  option4?: string;
  payer_auth?: string;
  get_token?: string;
  get_auth_amount?: string;
  currency_code?: string;
  note?: string;
  custom?: string;
  anet_customer_profiles?: boolean;
}

interface GatewayInfo {
  type?: string;
  username?: string;
  password?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  option5?: string;
  auth_full_amount?: string;
  auth_x_days?: string;
  avs_mismatch?: string;
  service_location?: string;
  partner?: string;
  security_key?: string;
  payer_auth?: string;
  get_token?: string;
  auth_amount?: string;
  custom_fields?: string;
  active?: string;
}

interface PaymentOpts {
  authorize_cim?: string;
  authorize_cim_env?: string;
  tokenize_cc_numbers?: string;
  [key: string]: string | undefined;
}

export default function PaymentGatewaysPage() {
  const [gatewayDefs, setGatewayDefs] = useState<Record<string, GatewayDefinition>>({});
  const [tokensAvailable, setTokensAvailable] = useState<string[]>([]);
  const [currentGateway, setCurrentGateway] = useState<GatewayInfo>({});
  const [paymentOpts, setPaymentOpts] = useState<PaymentOpts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Track which gateway is enabled (only one at a time)
  const [enabledGateway, setEnabledGateway] = useState<string>('0');
  // Track per-gateway form values
  const [gatewayValues, setGatewayValues] = useState<Record<string, Record<string, string>>>({});
  // Track which panels are expanded
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  // Track expand all state
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/payment/options/gateways');
      const d = res.data.data || {};

      const defs = d.gateway_definitions || {};
      const tokens = d.tokens_available || [];
      const current = d.current_gateway || {};
      const opts = d.payment_options || {};

      setGatewayDefs(defs);
      setTokensAvailable(tokens);
      setCurrentGateway(current);
      setPaymentOpts(opts);

      // Determine which gateway is enabled
      const activeType = (current.active === 'y' && current.type && current.type !== '0')
        ? current.type : '0';
      setEnabledGateway(activeType);

      // Pre-fill form values for the active gateway
      if (activeType !== '0') {
        setGatewayValues(prev => ({
          ...prev,
          [activeType]: {
            username: current.username || '',
            password: current.password || '',
            option1: current.option1 || '',
            option2: current.option2 || '',
            option3: current.option3 || '',
            option4: current.option4 || '',
            option5: current.option5 || '',
            auth_full_amount: current.auth_full_amount || 'y',
            auth_x_days: current.auth_x_days || '',
            avs_mismatch: current.avs_mismatch || '',
            service_location: current.service_location || '',
            partner: current.partner || '',
            security_key: current.security_key || '',
            payer_auth: current.payer_auth || 'n',
            get_token: current.get_token || '',
            auth_amount: current.auth_amount || '1.00',
            custom_fields: current.custom_fields || '',
          },
        }));
        // Auto-expand the active gateway panel
        setExpandedPanels(prev => ({ ...prev, [activeType]: true }));
      }
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Failed to load gateway options');
    } finally {
      setLoading(false);
    }
  };

  const getGatewayValue = (gwKey: string, field: string): string => {
    return gatewayValues[gwKey]?.[field] || '';
  };

  const setGatewayValue = (gwKey: string, field: string, value: string) => {
    setGatewayValues(prev => ({
      ...prev,
      [gwKey]: { ...(prev[gwKey] || {}), [field]: value },
    }));
  };

  const handleEnableGateway = (gwKey: string, enabled: boolean) => {
    if (enabled) {
      setEnabledGateway(gwKey);
      // Auto-expand the enabled gateway
      setExpandedPanels(prev => ({ ...prev, [gwKey]: true }));
    } else {
      if (enabledGateway === gwKey) {
        setEnabledGateway('0');
      }
    }
  };

  const togglePanel = (gwKey: string) => {
    setExpandedPanels(prev => ({ ...prev, [gwKey]: !prev[gwKey] }));
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    const newPanels: Record<string, boolean> = {};
    Object.keys(gatewayDefs).forEach(k => {
      if (k !== '0') newPanels[k] = newState;
    });
    setExpandedPanels(newPanels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      const gwData = enabledGateway !== '0' ? (gatewayValues[enabledGateway] || {}) : {};

      await api.post('/payment/options/gateways', {
        enabled_gateway: enabledGateway,
        gateway: gwData,
        payment_options: {
          authorize_cim: paymentOpts.authorize_cim || 'n',
          authorize_cim_env: paymentOpts.authorize_cim_env || '0',
          tokenize_cc_numbers: paymentOpts.tokenize_cc_numbers || 'n',
        },
      });

      setSuccess('Payment gateway settings saved successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(typeof d === 'string' ? d : 'Failed to save gateway settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div>
      <div className="row"><div className="col-lg-12">
        <h1>Payment Gateways</h1>
        <p><i className="fa fa-spinner fa-spin"></i> Loading gateway options...</p>
      </div></div>
    </div>
  );

  // Sort gateway keys by name (excluding '0')
  const gwKeys = Object.keys(gatewayDefs)
    .filter(k => k !== '0')
    .sort((a, b) => (gatewayDefs[a]?.name || '').localeCompare(gatewayDefs[b]?.name || ''));

  const renderGatewayPanel = (gwKey: string) => {
    const def = gatewayDefs[gwKey];
    if (!def) return null;

    const isEnabled = enabledGateway === gwKey;
    const isExpanded = expandedPanels[gwKey] || false;
    const isTokenAvailable = tokensAvailable.includes(gwKey);
    const vals = gatewayValues[gwKey] || {};

    return (
      <div className="panel panel-primary" key={gwKey} style={{ marginBottom: '0' }}>
        <div
          className="panel-heading"
          style={{ cursor: 'pointer', position: 'relative' }}
          onClick={() => togglePanel(gwKey)}
        >
          <h3 className="panel-title">
            <i className={`fa fa-toggle-${isExpanded ? 'up' : 'down'}`} style={{ marginRight: '8px' }}></i>
            {def.name}
            {isEnabled && (
              <span className="label label-success" style={{ marginLeft: '10px', fontSize: '11px' }}>
                <i className="fa fa-check"></i> ACTIVE
              </span>
            )}
            {isTokenAvailable && (
              <span className="label label-info" style={{ marginLeft: '6px', fontSize: '10px' }}>
                Tokens
              </span>
            )}
          </h3>
        </div>

        <div style={{ display: isExpanded ? 'block' : 'none' }}>
          <div className="panel-body">
            {/* Token note */}
            {isTokenAvailable && (
              <div className="form-group">
                <span className="label label-warning">Note</span> Tokens are available for this payment gateway.
              </div>
            )}

            {/* Enable toggle */}
            <div className="form-group">
              <label><strong>Enable</strong></label>
              <div>
                <label style={{ marginRight: '15px', fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name={`payment_gateway_${gwKey}`}
                    value="y"
                    checked={isEnabled}
                    onChange={() => handleEnableGateway(gwKey, true)}
                    style={{ marginRight: '4px' }}
                  />
                  Yes
                </label>
                <label style={{ fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name={`payment_gateway_${gwKey}`}
                    value="n"
                    checked={!isEnabled}
                    onChange={() => handleEnableGateway(gwKey, false)}
                    style={{ marginRight: '4px' }}
                  />
                  No
                </label>
              </div>
            </div>

            {/* Stripe/CyberSource API Type (option3 for key 18) */}
            {gwKey === '18' && def.request_type && (
              <div className="form-group">
                <label>API Type</label>
                <select
                  className="form-control"
                  value={vals.option3 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option3', e.target.value)}
                >
                  {Object.entries(def.request_type).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Username */}
            {def.username && (
              <div className="form-group">
                <label>
                  {def.username}
                  {(def.name === 'Authorize.Net Legacy' || def.name === 'Authorize.Net CIM') && ' (API Login ID)'}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={isEnabled ? (vals.username || '') : ''}
                  onChange={e => setGatewayValue(gwKey, 'username', e.target.value)}
                />
              </div>
            )}

            {/* Password */}
            {def.password && (
              <div className="form-group">
                <label>{def.password}</label>
                <input
                  type={def.name === 'CardConnect' ? 'password' : 'text'}
                  className="form-control"
                  value={isEnabled ? (vals.password || '') : ''}
                  onChange={e => setGatewayValue(gwKey, 'password', e.target.value)}
                />
              </div>
            )}

            {/* Security Key */}
            {def.security_key && (
              <div className="form-group">
                <label>{def.security_key}</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEnabled ? (vals.security_key || '') : ''}
                  onChange={e => setGatewayValue(gwKey, 'security_key', e.target.value)}
                />
              </div>
            )}

            {/* Partner */}
            {def.partner && (
              <div className="form-group">
                <label>{def.partner}</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEnabled ? (vals.partner || '') : ''}
                  onChange={e => setGatewayValue(gwKey, 'partner', e.target.value)}
                />
              </div>
            )}

            {/* Merchant ID (mapped to option2) */}
            {def.merchant_id && (
              <div className="form-group">
                <label>{def.merchant_id}</label>
                <input
                  type="text"
                  className="form-control"
                  value={vals.option2 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option2', e.target.value)}
                />
              </div>
            )}

            {/* Platform (mapped to option2) */}
            {def.platform && (
              <div className="form-group">
                <label>Platform</label>
                <select
                  className="form-control"
                  value={vals.option2 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option2', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {Object.entries(def.platform).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Terminal (mapped to option3) */}
            {def.terminal && (
              <div className="form-group">
                <label>{def.terminal}</label>
                <input
                  type="text"
                  className="form-control"
                  value={vals.option3 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option3', e.target.value)}
                />
              </div>
            )}

            {/* Currency dropdown (mapped to option4) */}
            {def.currency && (
              <div className="form-group">
                <label>Currency Type</label>
                <select
                  className="form-control"
                  value={vals.option4 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option4', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {Object.entries(def.currency).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Option4 text field (e.g. Vendor, API Domain, etc.) */}
            {def.option4 && typeof def.option4 === 'string' && !def.currency && (
              <div className="form-group">
                <label>{def.option4}</label>
                <input
                  type="text"
                  className="form-control"
                  value={vals.option4 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option4', e.target.value)}
                />
                {def.name === 'CardConnect' && (
                  <p className="help-block">
                    <i className="fa fa-info-circle"></i> Example: url.goeshere.com:6443, do not include https:// or anything after the port number
                  </p>
                )}
              </div>
            )}

            {/* Auth Type (option1) */}
            {def.auth && (
              <div className="form-group">
                <label>Auth Type</label>
                <select
                  className="form-control"
                  value={vals.option1 || ''}
                  onChange={e => setGatewayValue(gwKey, 'option1', e.target.value)}
                >
                  {Object.entries(def.auth).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Auth Full Amount */}
            <div className="form-group">
              <label>Auth Full Amount</label>
              <div>
                <label style={{ marginRight: '10px', fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name={`pg_auth_full_amount_${gwKey}`}
                    value="y"
                    checked={(vals.auth_full_amount || 'y') === 'y'}
                    onChange={() => setGatewayValue(gwKey, 'auth_full_amount', 'y')}
                    style={{ marginRight: '4px' }}
                  />
                  Yes
                </label>
                <label style={{ marginRight: '10px', fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name={`pg_auth_full_amount_${gwKey}`}
                    value="n"
                    checked={(vals.auth_full_amount || 'y') === 'n'}
                    onChange={() => setGatewayValue(gwKey, 'auth_full_amount', 'n')}
                    style={{ marginRight: '4px' }}
                  />
                  No
                  {def.get_auth_amount === 'y' && (
                    <span>
                      , use an authorization amount of $
                      <input
                        type="text"
                        className="form-control form-control-inline"
                        style={{ width: '80px', display: 'inline-block', marginLeft: '4px', marginRight: '4px' }}
                        value={vals.auth_amount || '1.00'}
                        onChange={e => setGatewayValue(gwKey, 'auth_amount', e.target.value)}
                      />
                    </span>
                  )}
                </label>
                <br />
                <label style={{ fontWeight: 'normal' }}>
                  <input
                    type="radio"
                    name={`pg_auth_full_amount_${gwKey}`}
                    value="x"
                    checked={(vals.auth_full_amount || 'y') === 'x'}
                    onChange={() => setGatewayValue(gwKey, 'auth_full_amount', 'x')}
                    style={{ marginRight: '4px' }}
                  />
                  Only when ship date is within{' '}
                  <input
                    type="text"
                    className="form-control form-control-inline"
                    style={{ width: '60px', display: 'inline-block', marginLeft: '4px', marginRight: '4px' }}
                    value={vals.auth_x_days || ''}
                    onChange={e => setGatewayValue(gwKey, 'auth_x_days', e.target.value)}
                  />
                  {' '}days
                </label>
              </div>
            </div>

            {/* AVS Mismatch */}
            <div className="form-group">
              <label>Accept AVS Response</label>
              <div>
                {[
                  { value: 'all', label: 'All Responses' },
                  { value: 'exact', label: 'Exact Matches Only' },
                  { value: 'partial', label: 'Partial Matches' },
                ].map(opt => (
                  <label key={opt.value} style={{ marginRight: '12px', fontWeight: 'normal' }}>
                    <input
                      type="radio"
                      name={`pg_avs_mismatch_${gwKey}`}
                      value={opt.value}
                      checked={(vals.avs_mismatch || '') === opt.value}
                      onChange={() => setGatewayValue(gwKey, 'avs_mismatch', opt.value)}
                      style={{ marginRight: '4px' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <p className="help-block">Only applies to auth only transactions.</p>
            </div>

            {/* Service Location */}
            {def.service_location && (
              <div className="form-group">
                <label>Service Location</label>
                <select
                  className="form-control"
                  value={vals.service_location || ''}
                  onChange={e => setGatewayValue(gwKey, 'service_location', e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {Object.entries(def.service_location).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Environment */}
            {def.environment && (
              <div className="form-group">
                <label>Environment</label>
                <div>
                  {Object.entries(def.environment).map(([val, label]) => (
                    <label key={val} style={{ marginRight: '12px', fontWeight: 'normal' }}>
                      <input
                        type="radio"
                        name={`pg_option3_${gwKey}`}
                        value={val}
                        checked={(vals.option3 || '') === val}
                        onChange={() => setGatewayValue(gwKey, 'option3', val)}
                        style={{ marginRight: '4px' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Payer Auth */}
            {def.payer_auth && (
              <div className="form-group">
                <label>{def.payer_auth}</label>
                <div>
                  <label style={{ marginRight: '12px', fontWeight: 'normal' }}>
                    <input type="radio" name={`pg_payer_auth_${gwKey}`} value="y"
                      checked={(vals.payer_auth || 'n') === 'y'}
                      onChange={() => setGatewayValue(gwKey, 'payer_auth', 'y')}
                      style={{ marginRight: '4px' }}
                    /> Yes
                  </label>
                  <label style={{ fontWeight: 'normal' }}>
                    <input type="radio" name={`pg_payer_auth_${gwKey}`} value="n"
                      checked={(vals.payer_auth || 'n') === 'n'}
                      onChange={() => setGatewayValue(gwKey, 'payer_auth', 'n')}
                      style={{ marginRight: '4px' }}
                    /> No
                  </label>
                </div>
              </div>
            )}

            {/* Get Token */}
            {def.get_token && (
              <div className="form-group">
                <label>{def.get_token}</label>
                <div>
                  <label style={{ marginRight: '12px', fontWeight: 'normal' }}>
                    <input type="radio" name={`pg_get_token_${gwKey}`} value="y"
                      checked={(vals.get_token || 'n') === 'y'}
                      onChange={() => setGatewayValue(gwKey, 'get_token', 'y')}
                      style={{ marginRight: '4px' }}
                    /> Yes
                  </label>
                  <label style={{ fontWeight: 'normal' }}>
                    <input type="radio" name={`pg_get_token_${gwKey}`} value="n"
                      checked={(vals.get_token || 'n') === 'n'}
                      onChange={() => setGatewayValue(gwKey, 'get_token', 'n')}
                      style={{ marginRight: '4px' }}
                    /> No
                  </label>
                </div>
              </div>
            )}

            {/* Note */}
            {def.note && (
              <div className="form-group">
                <p className="help-block" dangerouslySetInnerHTML={{ __html: def.note }}></p>
              </div>
            )}

            {/* Authorize.Net CIM settings */}
            {def.anet_customer_profiles && (
              <>
                <div className="form-group">
                  <label style={{ fontWeight: 'normal' }}>
                    <input
                      type="checkbox"
                      checked={paymentOpts.authorize_cim === 'y'}
                      onChange={e => setPaymentOpts(prev => ({
                        ...prev,
                        authorize_cim: e.target.checked ? 'y' : 'n',
                      }))}
                      style={{ marginRight: '6px' }}
                    />
                    Allow my customers to store payment data using Authorize.NET&apos;s Customer Information Manager (CIM).
                  </label>
                </div>
                <div className="form-group">
                  <label>CIM Environment</label>
                  <div>
                    <label style={{ marginRight: '12px', fontWeight: 'normal' }}>
                      <input type="radio" value="0"
                        checked={(paymentOpts.authorize_cim_env || '0') === '0'}
                        onChange={() => setPaymentOpts(prev => ({ ...prev, authorize_cim_env: '0' }))}
                        style={{ marginRight: '4px' }}
                      /> Testing
                    </label>
                    <label style={{ fontWeight: 'normal' }}>
                      <input type="radio" value="1"
                        checked={(paymentOpts.authorize_cim_env || '0') === '1'}
                        onChange={() => setPaymentOpts(prev => ({ ...prev, authorize_cim_env: '1' }))}
                        style={{ marginRight: '4px' }}
                      /> Live
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Sage VT note */}
            {gwKey === '16' && (
              <div className="form-group">
                <p className="help-block">
                  In order to use Sage VT&apos;s processor in your store you must enable the &apos;XML Web Services&apos; option
                  in your Sage VT admin area under &apos;Configuration -&gt; Account Settings.&apos;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Payment Gateways</h1>
          <p>
            <span className="label label-warning">Note</span>{' '}
            New settings / setting changes will not be saved unless the gateway for which you are making
            the changes is enabled.<br /><br />
            If you are switching from one payment gateway to another, please make note of all your current
            gateway&apos;s settings before making changes, in case you need to switch back - otherwise they
            will be lost when you save the new settings.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row"><div className="col-lg-12">
          <div className="alert alert-danger">
            <i className="fa fa-exclamation-circle"></i> {error}
            <button type="button" className="close" onClick={() => setError(null)}>&times;</button>
          </div>
        </div></div>
      )}
      {success && (
        <div className="row"><div className="col-lg-12">
          <div className="alert alert-success">
            <i className="fa fa-check-circle"></i> {success}
            <button type="button" className="close" onClick={() => setSuccess(null)}>&times;</button>
          </div>
        </div></div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <p>
            <button type="button" className="btn btn-primary btn-sm" onClick={toggleAll}>
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </p>
        </div>
      </div>
      <br />

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="accordion-gateways">
              {gwKeys.map(k => renderGatewayPanel(k))}
            </div>
          </div>
        </div>

        <br />
        <div className="row">
          <div className="col-lg-12">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>{' '}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
