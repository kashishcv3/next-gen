'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface City {
  id: number;
  city: string;
  city_rate: string;
  county_rate: string;
  local_rate: string;
}

interface TaxTable {
  id: number;
  state: string;
  state_rate: string;
  include_shipping: string;
  apply_tax_to: string;
  cities?: City[];
}

export default function TaxListPage() {
  const [tables, setTables] = useState<TaxTable[]>([]);
  const [stateNames, setStateNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteStates, setDeleteStates] = useState<Set<number>>(new Set());
  const [deleteCities, setDeleteCities] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tax/tables');
      const data = res.data.data || [];
      const states = res.data.states || {};
      setStateNames(states);
      setTables(data);

      const initial: Record<string, any> = {};
      data.forEach((t: TaxTable) => {
        initial[`state_rate_${t.id}`] = t.state_rate;
        initial[`include_shipping_${t.id}`] = t.include_shipping === 'y';
        initial[`apply_tax_to_${t.id}`] = t.apply_tax_to || 'ship';
        if (t.cities) {
          t.cities.forEach((c) => {
            initial[`city_rate_${c.id}`] = c.city_rate;
            initial[`county_rate_${c.id}`] = c.county_rate;
            initial[`local_rate_${c.id}`] = c.local_rate;
          });
        }
      });
      setFormData(initial);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tax tables');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (stateId: number) => {
    const n = new Set(expandedStates);
    if (n.has(stateId)) n.delete(stateId); else n.add(stateId);
    setExpandedStates(n);
  };

  const toggleDeleteState = (id: number) => {
    const n = new Set(deleteStates);
    if (n.has(id)) n.delete(id); else n.add(id);
    setDeleteStates(n);
  };

  const toggleDeleteCity = (id: number) => {
    const n = new Set(deleteCities);
    if (n.has(id)) n.delete(id); else n.add(id);
    setDeleteCities(n);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null); setError(null); setSaving(true);
    try {
      const payload: Record<string, any> = { ...formData };
      if (deleteStates.size > 0) payload.delete_state = Array.from(deleteStates);
      if (deleteCities.size > 0) payload.delete_city = Array.from(deleteCities);

      await api.post('/tax/tables/update', payload);
      setSuccess('Tax tables updated successfully');
      setDeleteStates(new Set());
      setDeleteCities(new Set());
      setTimeout(() => { setSuccess(null); fetchTables(); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update tax tables');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = deleteStates.size > 0 || deleteCities.size > 0 || true; // always enable

  if (loading) return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <p><i className="fa fa-spinner fa-spin"></i> Loading tax tables...</p>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Tables</h1>
          <p><i className="fa fa-info-circle"></i> Manage your tax tables to set rates at the state, county, city, and local levels.</p>
        </div>
      </div>
      <br />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <p>
        <Link href="/dashboard/tax/add" className="btn btn-primary btn-sm">Add Tax Tables</Link>
      </p>
      <br />

      <form onSubmit={handleSubmit}>
        <input type="submit" value="Submit" className="btn btn-primary" disabled={saving} />
        <br /><br />

        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Location</th>
                      <th style={{ width: '15%' }}>Rate</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>County Rate</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Local Rate</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.length === 0 ? (
                      <tr><td colSpan={5} className="text-center">No tax tables found</td></tr>
                    ) : tables.map((table) => (
                      <React.Fragment key={table.id}>
                        <tr>
                          <td colSpan={5}>
                            <table style={{ width: '100%' }}>
                              <tbody>
                                <tr>
                                  <td>
                                    <a href="#" onClick={(e) => { e.preventDefault(); toggleExpanded(table.id); }}
                                      style={{ textDecoration: 'none' }}>
                                      <i className={`fa fa-${expandedStates.has(table.id) ? 'minus' : 'plus'}-square`}
                                        style={{ marginRight: '8px' }}></i>
                                    </a>
                                    {stateNames[table.state] || table.state}
                                  </td>
                                  <td style={{ width: '15%' }}>
                                    <input type="text" className="form-control form-control-inline" size={5}
                                      value={formData[`state_rate_${table.id}`] || ''}
                                      onChange={(e) => setFormData({ ...formData, [`state_rate_${table.id}`]: e.target.value })} />
                                  </td>
                                  <td style={{ width: '15%', textAlign: 'center' }}>&nbsp;</td>
                                  <td style={{ width: '15%', textAlign: 'center' }}>&nbsp;</td>
                                  <td style={{ width: '10%', textAlign: 'center' }}>
                                    <input type="checkbox"
                                      checked={deleteStates.has(table.id)}
                                      onChange={() => toggleDeleteState(table.id)} />
                                  </td>
                                </tr>
                                <tr>
                                  <td style={{ textAlign: 'center' }}>
                                    <input type="checkbox"
                                      checked={formData[`include_shipping_${table.id}`] || false}
                                      onChange={(e) => setFormData({ ...formData, [`include_shipping_${table.id}`]: e.target.checked })}
                                    /> include shipping
                                  </td>
                                  <td colSpan={4}>
                                    apply tax to&nbsp;
                                    <select className="form-control form-control-inline"
                                      value={formData[`apply_tax_to_${table.id}`] || 'ship'}
                                      onChange={(e) => setFormData({ ...formData, [`apply_tax_to_${table.id}`]: e.target.value })}>
                                      <option value="ship">Shipping State</option>
                                      <option value="bill">Billing State</option>
                                      <option value="both">Shipping or Billing State</option>
                                    </select>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        {expandedStates.has(table.id) && table.cities && table.cities.length > 0 && (
                          <tr>
                            <td colSpan={5}>
                              {table.cities.map((city) => (
                                <table key={city.id} className="table table-striped cv3-data-table" style={{ width: '100%', marginBottom: '2px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: '45%', paddingLeft: '40px' }}>
                                        <i className="fa fa-folder" style={{ marginRight: '4px', color: '#999' }}></i>
                                        <i className="fa fa-folder" style={{ marginRight: '4px', color: '#999' }}></i>
                                        {city.city}
                                      </td>
                                      <td style={{ width: '15%' }}>
                                        <input type="text" className="form-control form-control-inline" size={5}
                                          value={formData[`city_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`city_rate_${city.id}`]: e.target.value })} />
                                      </td>
                                      <td style={{ width: '15%', textAlign: 'center' }}>
                                        <input type="text" className="form-control form-control-inline" size={5}
                                          value={formData[`county_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`county_rate_${city.id}`]: e.target.value })} />
                                      </td>
                                      <td style={{ width: '15%', textAlign: 'center' }}>
                                        <input type="text" className="form-control form-control-inline" size={5}
                                          value={formData[`local_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`local_rate_${city.id}`]: e.target.value })} />
                                      </td>
                                      <td style={{ width: '10%', textAlign: 'center' }}>
                                        <input type="checkbox"
                                          checked={deleteCities.has(city.id)}
                                          onChange={() => toggleDeleteCity(city.id)} />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ))}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <input type="submit" value="Submit" className="btn btn-primary" disabled={saving} />
          </div>
        </div>
      </form>
    </div>
  );
}
