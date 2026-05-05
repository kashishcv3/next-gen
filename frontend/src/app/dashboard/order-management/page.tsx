'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderManagementData {
  [key: string]: string;
}

export default function OrderManagementPage() {
  const [options, setOptions] = useState<OrderManagementData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await api.get('/orders/management');
      const data = res.data.data || res.data || {};
      setOptions(data);

      // Determine which panel should be expanded
      const orderManagementValue = data.order_management || '';
      const panelMap: Record<string, number> = {
        'aero': 1,
        'mom': 2,
        'inorder': 3,
        'cms': 4,
        'ordermotion': 5,
        'syspro': 6,
        'ordermanager': 7,
        'vista': 8,
        'custom': 9
      };

      if (orderManagementValue && panelMap[orderManagementValue]) {
        setExpandedPanels(new Set([panelMap[orderManagementValue]]));
      } else {
        setExpandedPanels(new Set([0])); // Standard Integrations by default
      }
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(
        typeof d === 'string'
          ? d
          : Array.isArray(d)
          ? d.map((x: any) => x.msg).join(', ')
          : 'Failed to load options'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleEnableChange = (systemKey: string, enabled: boolean) => {
    if (enabled) {
      setOptions({ ...options, order_management: systemKey });
    } else {
      setOptions({ ...options, order_management: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);
    try {
      await api.post('/orders/management', options);
      setSuccess('Order Management settings saved successfully');
    } catch (err: any) {
      const d = err.response?.data?.detail;
      setError(
        typeof d === 'string'
          ? d
          : Array.isArray(d)
          ? d.map((x: any) => x.msg).join(', ')
          : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderRadio = (
    label: string,
    name: string,
    value: string,
    checked: boolean,
    onChange: (val: string) => void,
    options?: Array<{ value: string; label: string }>
  ) => {
    if (!options || options.length === 0) {
      return (
        <div className="form-group">
          <label>
            <input
              type="radio"
              name={name}
              value="y"
              checked={checked}
              onChange={() => onChange('y')}
            />{' '}
            Yes
          </label>{' '}
          <label>
            <input
              type="radio"
              name={name}
              value="n"
              checked={!checked}
              onChange={() => onChange('n')}
            />{' '}
            No
          </label>
          <div className="help-text">{label}</div>
        </div>
      );
    }

    return (
      <div className="form-group">
        <label>{label}</label>
        {options.map((opt) => (
          <label key={opt.value} style={{ marginRight: '20px' }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />{' '}
            {opt.label}
          </label>
        ))}
      </div>
    );
  };

  const renderTextInput = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    help?: string
  ) => {
    return (
      <div className="form-group">
        <label>{label}</label>
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ maxWidth: '500px' }}
        />
        {help && <small className="form-text text-muted">{help}</small>}
      </div>
    );
  };

  const togglePanel = (panelIndex: number) => {
    setExpandedPanels(prev => {
      const next = new Set(prev);
      if (next.has(panelIndex)) {
        next.delete(panelIndex);
      } else {
        next.add(panelIndex);
      }
      return next;
    });
  };

  const [allExpanded, setAllExpanded] = useState(false);
  const expandAllPanels = () => {
    if (allExpanded) {
      setExpandedPanels(new Set());
      setAllExpanded(false);
    } else {
      setExpandedPanels(new Set([0,1,2,3,4,5,6,7,8,9]));
      setAllExpanded(true);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p>
          <i className="fa fa-spinner fa-spin"></i> Loading...
        </p>
      </div>
    );
  }

  const currentSystem = options.order_management || '';

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Order Management</h1>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <p>
            <i className="fa fa-code"></i> = HTML Allowed
          </p>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">
              <i className="fa fa-check-circle"></i> {success}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-12">
          <button
            type="button"
            className="btn btn-default"
            onClick={expandAllPanels}
            style={{ marginBottom: '10px' }}
          >
            <i className="fa fa-expand"></i> Expand All
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel-group" id="orderManagementAccordion">
              {/* Panel 0: Standard Integrations */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(0)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(0) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Standard Integrations
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(0) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <p>
                      We currently integrate with several order managers. Select the one you use
                      below.
                    </p>
                    <div className="form-group">
                      <label>Web Service ID (Read-only)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={options.service_id || ''}
                        readOnly
                        style={{ maxWidth: '500px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 1: Aero Fulfillment */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(1)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(1) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Aero Fulfillment
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(1) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable Aero</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="aero_enable"
                          value="y"
                          checked={currentSystem === 'aero'}
                          onChange={() => handleEnableChange('aero', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="aero_enable"
                          value="n"
                          checked={currentSystem !== 'aero'}
                          onChange={() => handleEnableChange('aero', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Client ID',
                      options.aero_client_id || '',
                      (val) => handleChange('aero_client_id', val)
                    )}

                    {renderTextInput(
                      'Order ID Prefix',
                      options.aero_order_prefix || '',
                      (val) => handleChange('aero_order_prefix', val)
                    )}

                    {renderTextInput(
                      'Processing Error Email',
                      options.aero_error_email || '',
                      (val) => handleChange('aero_error_email', val)
                    )}

                    <div className="form-group">
                      <label>Send Shipping as Billing for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="aero_paypalexp"
                          value="y"
                          checked={options.aero_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('aero_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="aero_paypalexp"
                          value="n"
                          checked={options.aero_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('aero_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Dydacomp's Multichannel Order Manager */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(2)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(2) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Dydacomp's Multichannel Order Manager
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(2) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable MOM</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="mom_enable"
                          value="y"
                          checked={currentSystem === 'mom'}
                          onChange={() => handleEnableChange('mom', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="mom_enable"
                          value="n"
                          checked={currentSystem !== 'mom'}
                          onChange={() => handleEnableChange('mom', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Gift Wrap SKU',
                      options.mom_giftwrap_sku || '',
                      (val) => handleChange('mom_giftwrap_sku', val),
                      'Gift wrap will be exported as an item on the order.'
                    )}

                    <div className="form-group">
                      <label>Do you update subproducts and attributes from MOM using the product import?</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="mom_prod_import"
                          value="y"
                          checked={options.mom_prod_import_subprods === 'y'}
                          onChange={() => handleChange('mom_prod_import_subprods', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="mom_prod_import"
                          value="n"
                          checked={options.mom_prod_import_subprods !== 'y'}
                          onChange={() => handleChange('mom_prod_import_subprods', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Morse Data's InOrder */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(3)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(3) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Morse Data's InOrder
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(3) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable InOrder</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="inorder_enable"
                          value="y"
                          checked={currentSystem === 'inorder'}
                          onChange={() => handleEnableChange('inorder', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="inorder_enable"
                          value="n"
                          checked={currentSystem !== 'inorder'}
                          onChange={() => handleEnableChange('inorder', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Orders</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="in_auto_download"
                          value="y"
                          checked={options.in_auto_download === 'y'}
                          onChange={() => handleChange('in_auto_download', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="in_auto_download"
                          value="n"
                          checked={options.in_auto_download !== 'y'}
                          onChange={() => handleChange('in_auto_download', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Upload Inventory Counts Hourly</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="in_auto_inventory"
                          value="y"
                          checked={options.in_auto_inventory === 'y'}
                          onChange={() => handleChange('in_auto_inventory', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="in_auto_inventory"
                          value="n"
                          checked={options.in_auto_inventory !== 'y'}
                          onChange={() => handleChange('in_auto_inventory', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Catalog Requests</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="in_catalog_request"
                          value="y"
                          checked={options.in_catalog_request === 'y'}
                          onChange={() => handleChange('in_catalog_request', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="in_catalog_request"
                          value="n"
                          checked={options.in_catalog_request !== 'y'}
                          onChange={() => handleChange('in_catalog_request', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Process Gift Cards</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="in_gc_processor"
                          value="y"
                          checked={options.in_gc_processor === 'y'}
                          onChange={() => handleChange('in_gc_processor', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="in_gc_processor"
                          value="n"
                          checked={options.in_gc_processor !== 'y'}
                          onChange={() => handleChange('in_gc_processor', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Stunnel IP',
                      options.in_st_ip || '',
                      (val) => handleChange('in_st_ip', val)
                    )}

                    {renderTextInput(
                      'Stunnel Port',
                      options.in_st_port || '',
                      (val) => handleChange('in_st_port', val)
                    )}

                    {renderTextInput(
                      'Database Host',
                      options.in_db_host || '',
                      (val) => handleChange('in_db_host', val)
                    )}

                    {renderTextInput(
                      'Database Port',
                      options.in_db_port || '',
                      (val) => handleChange('in_db_port', val)
                    )}

                    {renderTextInput(
                      'Database Name',
                      options.in_db_name || '',
                      (val) => handleChange('in_db_name', val)
                    )}

                    {renderTextInput(
                      'Database User',
                      options.in_db_user || '',
                      (val) => handleChange('in_db_user', val)
                    )}

                    {renderTextInput(
                      'Database Password',
                      options.in_db_pass || '',
                      (val) => handleChange('in_db_pass', val)
                    )}

                    {renderTextInput(
                      'Owner Code',
                      options.in_owner_code || '',
                      (val) => handleChange('in_owner_code', val)
                    )}

                    {renderTextInput(
                      'Order Class',
                      options.in_order_class || '',
                      (val) => handleChange('in_order_class', val)
                    )}

                    {renderTextInput(
                      'Default Campaign Code',
                      options.in_campaign_code || '',
                      (val) => handleChange('in_campaign_code', val)
                    )}
                  </div>
                </div>
              </div>

              {/* Panel 4: NewHaven Software's CMS */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(4)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(4) ? 'up' : 'down'}`}
                    ></i>{' '}
                    NewHaven Software's CMS
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(4) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable CMS</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="cms_enable"
                          value="y"
                          checked={currentSystem === 'cms'}
                          onChange={() => handleEnableChange('cms', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="cms_enable"
                          value="n"
                          checked={currentSystem !== 'cms'}
                          onChange={() => handleEnableChange('cms', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Product Import Function</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="cms_import"
                          value="automatic"
                          checked={options.cms_import === 'automatic'}
                          onChange={() => handleChange('cms_import', 'automatic')}
                        />{' '}
                        Automatic
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="cms_import"
                          value="manual"
                          checked={options.cms_import === 'manual'}
                          onChange={() => handleChange('cms_import', 'manual')}
                        />{' '}
                        Manual
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Multiple Quantities in Order Export</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="cms_lineitem"
                          value="single"
                          checked={options.cms_lineitem === 'single'}
                          onChange={() => handleChange('cms_lineitem', 'single')}
                        />{' '}
                        Single
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="cms_lineitem"
                          value="multiple"
                          checked={options.cms_lineitem === 'multiple'}
                          onChange={() => handleChange('cms_lineitem', 'multiple')}
                        />{' '}
                        Multiple
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Use Attribute SKU in Order Export</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="cms_use_att_sku"
                          value="y"
                          checked={options.cms_use_att_sku === 'y'}
                          onChange={() => handleChange('cms_use_att_sku', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="cms_use_att_sku"
                          value="n"
                          checked={options.cms_use_att_sku !== 'y'}
                          onChange={() => handleChange('cms_use_att_sku', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Send Shipping as Billing Address for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="cms_paypalexp"
                          value="y"
                          checked={options.cms_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('cms_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="cms_paypalexp"
                          value="n"
                          checked={options.cms_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('cms_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 5: OrderMotion */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(5)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(5) ? 'up' : 'down'}`}
                    ></i>{' '}
                    OrderMotion
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(5) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable OrderMotion</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="ordermotion_enable"
                          value="y"
                          checked={currentSystem === 'ordermotion'}
                          onChange={() => handleEnableChange('ordermotion', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="ordermotion_enable"
                          value="n"
                          checked={currentSystem !== 'ordermotion'}
                          onChange={() => handleEnableChange('ordermotion', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>API Version</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_version"
                          value="1.00"
                          checked={options.om_version === '1.00'}
                          onChange={() => handleChange('om_version', '1.00')}
                        />{' '}
                        1.00
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_version"
                          value="1.10"
                          checked={options.om_version === '1.10'}
                          onChange={() => handleChange('om_version', '1.10')}
                        />{' '}
                        1.10
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Orders and Catalog Requests</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_auto_download"
                          value="y"
                          checked={options.om_auto_download === 'y'}
                          onChange={() => handleChange('om_auto_download', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_auto_download"
                          value="n"
                          checked={options.om_auto_download !== 'y'}
                          onChange={() => handleChange('om_auto_download', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Update Inventory Counts Hourly</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_auto_inventory"
                          value="y"
                          checked={options.om_auto_inventory === 'y'}
                          onChange={() => handleChange('om_auto_inventory', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_auto_inventory"
                          value="n"
                          checked={options.om_auto_inventory !== 'y'}
                          onChange={() => handleChange('om_auto_inventory', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Update Order Status and Tracking Hourly</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_auto_shipping_history"
                          value="y"
                          checked={options.om_auto_shipping_history === 'y'}
                          onChange={() => handleChange('om_auto_shipping_history', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_auto_shipping_history"
                          value="n"
                          checked={options.om_auto_shipping_history !== 'y'}
                          onChange={() => handleChange('om_auto_shipping_history', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Shipping Calculations</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_auto_shipping"
                          value="y"
                          checked={options.om_auto_shipping === 'y'}
                          onChange={() => handleChange('om_auto_shipping', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_auto_shipping"
                          value="n"
                          checked={options.om_auto_shipping !== 'y'}
                          onChange={() => handleChange('om_auto_shipping', 'n')}
                        />{' '}
                        No
                      </label>
                      <small className="form-text text-muted">
                        This will override built-in shipping calculations
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Send Source Code in Keycode Field</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_sourcetokeycode"
                          value="y"
                          checked={options.om_sourcetokeycode === 'y'}
                          onChange={() => handleChange('om_sourcetokeycode', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_sourcetokeycode"
                          value="n"
                          checked={options.om_sourcetokeycode !== 'y'}
                          onChange={() => handleChange('om_sourcetokeycode', 'n')}
                        />{' '}
                        No
                      </label>
                      <small className="form-text text-muted">
                        IMPORTANT: The source code values MUST be set up as keycodes in OrderMotion.
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Pad Temporary Order ID to 16 Characters for Chase Paymentech</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_paymentech_pad"
                          value="y"
                          checked={options.om_paymentech_pad === 'y'}
                          onChange={() => handleChange('om_paymentech_pad', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_paymentech_pad"
                          value="n"
                          checked={options.om_paymentech_pad !== 'y'}
                          onChange={() => handleChange('om_paymentech_pad', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Process Gift Certificates</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_gc_processor"
                          value="y"
                          checked={options.om_gc_processor === 'y'}
                          onChange={() => handleChange('om_gc_processor', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_gc_processor"
                          value="n"
                          checked={options.om_gc_processor !== 'y'}
                          onChange={() => handleChange('om_gc_processor', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Send Shipping as Billing Address for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_paypalexp"
                          value="y"
                          checked={options.om_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('om_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_paypalexp"
                          value="n"
                          checked={options.om_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('om_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Default Order Keycode',
                      options.om_keycode || '',
                      (val) => handleChange('om_keycode', val)
                    )}

                    {renderTextInput(
                      'Default Catalog Keycode',
                      options.om_cat_keycode || '',
                      (val) => handleChange('om_cat_keycode', val)
                    )}

                    <div className="form-group">
                      <label>Use Catalog Request Source Code Instead of Default Catalog Keycode</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_use_cat_source"
                          value="y"
                          checked={options.om_use_cat_source === 'y'}
                          onChange={() => handleChange('om_use_cat_source', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_use_cat_source"
                          value="n"
                          checked={options.om_use_cat_source !== 'y'}
                          onChange={() => handleChange('om_use_cat_source', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Use Custom Checkout Field as Customer's Date of Birth</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_dob"
                          value="0"
                          checked={options.om_dob === '0' || !options.om_dob}
                          onChange={() => handleChange('om_dob', '0')}
                        />{' '}
                        No
                      </label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_dob"
                          value="1"
                          checked={options.om_dob === '1'}
                          onChange={() => handleChange('om_dob', '1')}
                        />{' '}
                        Custom Field 1
                      </label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="om_dob"
                          value="2"
                          checked={options.om_dob === '2'}
                          onChange={() => handleChange('om_dob', '2')}
                        />{' '}
                        Custom Field 2
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="om_dob"
                          value="3"
                          checked={options.om_dob === '3'}
                          onChange={() => handleChange('om_dob', '3')}
                        />{' '}
                        Custom Field 3
                      </label>
                    </div>

                    {renderTextInput(
                      'Store Code',
                      options.om_store_code || '',
                      (val) => handleChange('om_store_code', val)
                    )}

                    {renderTextInput(
                      'User PIN',
                      options.om_pin || '',
                      (val) => handleChange('om_pin', val)
                    )}

                    {renderTextInput(
                      'HTTPBizID',
                      options.om_httpbizid || '',
                      (val) => handleChange('om_httpbizid', val)
                    )}
                  </div>
                </div>
              </div>

              {/* Panel 6: SysPro */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(6)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(6) ? 'up' : 'down'}`}
                    ></i>{' '}
                    SysPro
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(6) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable SysPro</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="syspro_enable"
                          value="y"
                          checked={currentSystem === 'syspro'}
                          onChange={() => handleEnableChange('syspro', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="syspro_enable"
                          value="n"
                          checked={currentSystem !== 'syspro'}
                          onChange={() => handleEnableChange('syspro', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Orders</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="sp_auto_download"
                          value="y"
                          checked={options.sp_auto_download === 'y'}
                          onChange={() => handleChange('sp_auto_download', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="sp_auto_download"
                          value="n"
                          checked={options.sp_auto_download !== 'y'}
                          onChange={() => handleChange('sp_auto_download', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Update Order Status and Tracking</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="sp_auto_tracking"
                          value="y"
                          checked={options.sp_auto_tracking === 'y'}
                          onChange={() => handleChange('sp_auto_tracking', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="sp_auto_tracking"
                          value="n"
                          checked={options.sp_auto_tracking !== 'y'}
                          onChange={() => handleChange('sp_auto_tracking', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Web Service IP or Domain Name',
                      options.sp_service_location || '',
                      (val) => handleChange('sp_service_location', val),
                      'Ex: 255.255.255.255 or www.domain.com'
                    )}

                    <div className="form-group">
                      <label>Send Shipping as Billing Address for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="sp_paypalexp"
                          value="y"
                          checked={options.sp_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('sp_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="sp_paypalexp"
                          value="n"
                          checked={options.sp_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('sp_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 7: The Stone Edge Order Manager */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(7)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(7) ? 'up' : 'down'}`}
                    ></i>{' '}
                    The Stone Edge Order Manager
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(7) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable Stone Edge</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="ordermanager_enable"
                          value="y"
                          checked={currentSystem === 'ordermanager'}
                          onChange={() => handleEnableChange('ordermanager', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="ordermanager_enable"
                          value="n"
                          checked={currentSystem !== 'ordermanager'}
                          onChange={() => handleEnableChange('ordermanager', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Export Promo Code as Coupon</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_coupon"
                          value="y"
                          checked={options.se_coupon === 'y'}
                          onChange={() => handleChange('se_coupon', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_coupon"
                          value="n"
                          checked={options.se_coupon !== 'y'}
                          onChange={() => handleChange('se_coupon', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Export Discount Amount with Coupon</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_discount"
                          value="y"
                          checked={options.se_discount === 'y'}
                          onChange={() => handleChange('se_discount', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_discount"
                          value="n"
                          checked={options.se_discount !== 'y'}
                          onChange={() => handleChange('se_discount', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Export Customer Number in Custom Checkout Field</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_user_id"
                          value="y"
                          checked={options.se_user_id === 'y'}
                          onChange={() => handleChange('se_user_id', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_user_id"
                          value="n"
                          checked={options.se_user_id !== 'y'}
                          onChange={() => handleChange('se_user_id', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        Export Customer Number as WebCustomerID for Orders and WebID for Customer Exports
                      </label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_custnum"
                          value="y"
                          checked={options.se_custnum_webcustid === 'y'}
                          onChange={() => handleChange('se_custnum_webcustid', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_custnum"
                          value="n"
                          checked={options.se_custnum_webcustid !== 'y'}
                          onChange={() => handleChange('se_custnum_webcustid', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Send Shipping as Billing Address for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_paypalexp"
                          value="y"
                          checked={options.se_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('se_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_paypalexp"
                          value="n"
                          checked={options.se_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('se_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Sort Products in Order Exports By</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="se_product_sort"
                          value="name"
                          checked={options.se_product_sort === 'name'}
                          onChange={() => handleChange('se_product_sort', 'name')}
                        />{' '}
                        Name
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="se_product_sort"
                          value="sku"
                          checked={options.se_product_sort === 'sku'}
                          onChange={() => handleChange('se_product_sort', 'sku')}
                        />{' '}
                        SKU
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 8: Vista */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(8)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(8) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Vista
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(8) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable Vista</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="vista_enable"
                          value="y"
                          checked={currentSystem === 'vista'}
                          onChange={() => handleEnableChange('vista', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vista_enable"
                          value="n"
                          checked={currentSystem !== 'vista'}
                          onChange={() => handleEnableChange('vista', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Orders</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="vi_auto_download"
                          value="y"
                          checked={options.vi_auto_download === 'y'}
                          onChange={() => handleChange('vi_auto_download', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vi_auto_download"
                          value="n"
                          checked={options.vi_auto_download !== 'y'}
                          onChange={() => handleChange('vi_auto_download', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Web Site ID',
                      options.vi_web_id || '',
                      (val) => handleChange('vi_web_id', val)
                    )}

                    {renderTextInput(
                      'Identifier/Session ID',
                      options.vi_identifier || '',
                      (val) => handleChange('vi_identifier', val)
                    )}

                    {renderTextInput(
                      'Processing Error Notification Email',
                      options.vi_error_email || '',
                      (val) => handleChange('vi_error_email', val)
                    )}

                    <div className="form-group">
                      <label>Environment</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="vi_environment"
                          value="test"
                          checked={options.vi_environment === 'test'}
                          onChange={() => handleChange('vi_environment', 'test')}
                        />{' '}
                        Test
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vi_environment"
                          value="production"
                          checked={options.vi_environment === 'production'}
                          onChange={() => handleChange('vi_environment', 'production')}
                        />{' '}
                        Production
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Send Shipping as Billing Address for PayPal Express</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="vi_paypalexp"
                          value="y"
                          checked={options.vi_paypalexp_copyshipbill === 'y'}
                          onChange={() => handleChange('vi_paypalexp_copyshipbill', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="vi_paypalexp"
                          value="n"
                          checked={options.vi_paypalexp_copyshipbill !== 'y'}
                          onChange={() => handleChange('vi_paypalexp_copyshipbill', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 9: Custom Order Management */}
              <div className="panel panel-primary">
                <div
                  className="panel-heading"
                  onClick={() => togglePanel(9)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="panel-title">
                    <i
                      className={`fa fa-toggle-${expandedPanels.has(9) ? 'up' : 'down'}`}
                    ></i>{' '}
                    Custom Order Management
                  </h4>
                </div>
                <div className={`panel-collapse collapse ${expandedPanels.has(9) ? 'in' : ''}`}>
                  <div className="panel-body">
                    <div className="form-group">
                      <label>Enable Custom</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_enable"
                          value="y"
                          checked={currentSystem === 'custom'}
                          onChange={() => handleEnableChange('custom', true)}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_enable"
                          value="n"
                          checked={currentSystem !== 'custom'}
                          onChange={() => handleEnableChange('custom', false)}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Staging/Live</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_live"
                          value="y"
                          checked={options.custom_live === 'y'}
                          onChange={() => handleChange('custom_live', 'y')}
                        />{' '}
                        Live
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_live"
                          value="n"
                          checked={options.custom_live !== 'y'}
                          onChange={() => handleChange('custom_live', 'n')}
                        />{' '}
                        Staging
                      </label>
                      <small className="form-text text-muted">
                        Note: When set to Live, orders from Staging stores will still be sent
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Download Orders Real-Time</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_auto_download"
                          value="y"
                          checked={options.custom_auto_download === 'y'}
                          onChange={() => handleChange('custom_auto_download', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_auto_download"
                          value="n"
                          checked={options.custom_auto_download !== 'y'}
                          onChange={() => handleChange('custom_auto_download', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Update Inventory Counts Hourly</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_inventory"
                          value="y"
                          checked={options.custom_inventory_updates === 'y'}
                          onChange={() => handleChange('custom_inventory_updates', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_inventory"
                          value="n"
                          checked={options.custom_inventory_updates !== 'y'}
                          onChange={() => handleChange('custom_inventory_updates', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Download Catalog Requests</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_catalog"
                          value="y"
                          checked={options.custom_catalog_requests === 'y'}
                          onChange={() => handleChange('custom_catalog_requests', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_catalog"
                          value="n"
                          checked={options.custom_catalog_requests !== 'y'}
                          onChange={() => handleChange('custom_catalog_requests', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Automatically Update Order Status and Tracking Hourly</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_shipping"
                          value="y"
                          checked={options.custom_auto_shipping_history === 'y'}
                          onChange={() => handleChange('custom_auto_shipping_history', 'y')}
                        />{' '}
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_shipping"
                          value="n"
                          checked={options.custom_auto_shipping_history !== 'y'}
                          onChange={() => handleChange('custom_auto_shipping_history', 'n')}
                        />{' '}
                        No
                      </label>
                    </div>

                    {renderTextInput(
                      'Server URL',
                      options.custom_url || '',
                      (val) => handleChange('custom_url', val)
                    )}

                    {renderTextInput(
                      'API Key Name',
                      options.custom_keyname || '',
                      (val) => handleChange('custom_keyname', val)
                    )}

                    {renderTextInput(
                      'API Key',
                      options.custom_apikey || '',
                      (val) => handleChange('custom_apikey', val)
                    )}

                    <div className="form-group">
                      <label>Protocol</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_protocol"
                          value="http"
                          checked={options.custom_protocol === 'http'}
                          onChange={() => handleChange('custom_protocol', 'http')}
                        />{' '}
                        HTTP
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_protocol"
                          value="https"
                          checked={options.custom_protocol === 'https'}
                          onChange={() => handleChange('custom_protocol', 'https')}
                        />{' '}
                        HTTPS
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Data Format</label>
                      <label style={{ marginRight: '20px' }}>
                        <input
                          type="radio"
                          name="custom_format"
                          value="xml"
                          checked={options.custom_format === 'xml'}
                          onChange={() => handleChange('custom_format', 'xml')}
                        />{' '}
                        XML
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="custom_format"
                          value="json"
                          checked={options.custom_format === 'json'}
                          onChange={() => handleChange('custom_format', 'json')}
                        />{' '}
                        JSON
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <br />
        <div className="row">
          <div className="col-lg-12">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i> Save
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
