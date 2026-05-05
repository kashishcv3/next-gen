'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function TaxListAddPage() {
  const [states, setStates] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Import form
  const [importFile, setImportFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState('tab');
  const [contactEmail, setContactEmail] = useState('');
  const [importing, setImporting] = useState(false);

  // Add State form
  const [taxState, setTaxState] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [applyTaxTo, setApplyTaxTo] = useState('ship');
  const [includeShipping, setIncludeShipping] = useState(false);
  const [addingState, setAddingState] = useState(false);

  // Add City form
  const [cityState, setCityState] = useState('');
  const [city, setCity] = useState('');
  const [cityRate, setCityRate] = useState('');
  const [countyRate, setCountyRate] = useState('');
  const [localRate, setLocalRate] = useState('');
  const [addingCity, setAddingCity] = useState(false);

  useEffect(() => {
    api.get('/tax/states').then(res => setStates(res.data.states || {})).catch(() => {});
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) { setError('Please select a file'); return; }
    setImporting(true); setError(null); setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('cv3_list', importFile);
      formData.append('delimiter', delimiter);
      formData.append('contact_email', contactEmail);
      const res = await api.post('/tax/tables/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(res.data.message || 'Import completed successfully');
      setImportFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxState) { setError('Please select a state'); return; }
    setAddingState(true); setError(null); setSuccess(null);
    try {
      await api.post('/tax/tables/add-state', {
        tax_state: taxState,
        tax_rate: taxRate || '0',
        apply_tax_to: applyTaxTo,
        include_shipping: includeShipping ? 'y' : 'n',
      });
      setSuccess('State added successfully');
      setTaxState(''); setTaxRate('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add state');
    } finally {
      setAddingState(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityState || !city) { setError('State and City are required'); return; }
    setAddingCity(true); setError(null); setSuccess(null);
    try {
      await api.post('/tax/tables/add-city', {
        state: cityState,
        city,
        city_rate: cityRate || '0',
        county_rate: countyRate || '0',
        local_rate: localRate || '0',
      });
      setSuccess('City added successfully');
      setCity(''); setCityRate(''); setCountyRate(''); setLocalRate('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add city');
    } finally {
      setAddingCity(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Tax Tables</h1>
          <p><i className="fa fa-info-circle"></i> Manage your tax tables to set rates at the state, county, city, and local levels.</p>
          <p><Link href="/dashboard/tax/list" className="btn btn-primary btn-sm">Back to List</Link></p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row">
        <div className="col-lg-12">
          {/* Import Tax Tables */}
          <form onSubmit={handleImport} encType="multipart/form-data">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Import Tax Tables</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Field List: State, State Rate, City, City Rate, County Rate, Local Rate</label>
                </div>
                <div className="form-group">
                  <label>Choose File</label>
                  <input className="form-control" type="file"
                    onChange={(e) => { if (e.target.files?.length) setImportFile(e.target.files[0]); }} />
                </div>
                <div className="form-group">
                  <label>Delimiter Type</label>
                  <select className="form-control" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                    <option value="tab">Tab Delimited</option>
                    <option value="pipe">Pipe Delimited</option>
                    <option value="comma">Comma Delimited</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Email Address</label>
                  <input type="text" className="form-control" value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)} />
                </div>
              </div>
            </div>
            <input type="submit" value={importing ? 'Importing...' : 'Submit'} className="btn btn-primary" disabled={importing} />
          </form>
          <br />

          {/* Add State */}
          <form onSubmit={handleAddState}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Add State</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>State</label>
                  <select className="form-control" value={taxState} onChange={(e) => setTaxState(e.target.value)}>
                    <option value="">-- Select State --</option>
                    {Object.entries(states).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rate</label>
                  <input type="text" className="form-control" value={taxRate} size={6}
                    onChange={(e) => setTaxRate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Apply Tax To</label>
                  <select className="form-control" value={applyTaxTo} onChange={(e) => setApplyTaxTo(e.target.value)}>
                    <option value="ship">Shipping State</option>
                    <option value="bill">Billing State</option>
                    <option value="both">Shipping or Billing State</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Include Shipping{' '}
                    <input type="checkbox" checked={includeShipping}
                      onChange={(e) => setIncludeShipping(e.target.checked)} />
                  </label>
                </div>
              </div>
            </div>
            <input type="submit" value={addingState ? 'Adding...' : 'Submit'} className="btn btn-primary" disabled={addingState} />
          </form>
          <br />

          {/* Add City */}
          <form onSubmit={handleAddCity}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Add City</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>State</label>
                  <select className="form-control" value={cityState} onChange={(e) => setCityState(e.target.value)}>
                    <option value="">-- Select State --</option>
                    {Object.entries(states).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-control" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>City Rate</label>
                  <input type="text" className="form-control" value={cityRate} size={6}
                    onChange={(e) => setCityRate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>County Rate</label>
                  <input type="text" className="form-control" value={countyRate} size={6}
                    onChange={(e) => setCountyRate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Local Rate</label>
                  <input type="text" className="form-control" value={localRate} size={6}
                    onChange={(e) => setLocalRate(e.target.value)} />
                </div>
              </div>
            </div>
            <input type="submit" value={addingCity ? 'Adding...' : 'Submit'} className="btn btn-primary" disabled={addingCity} />
          </form>
        </div>
      </div>
    </div>
  );
}
