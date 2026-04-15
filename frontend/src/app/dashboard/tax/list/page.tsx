'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface City {
  id: string;
  city: string;
  city_rate: string;
  county_rate: string;
  local_rate: string;
}

interface TaxTable {
  id: string;
  state: string;
  state_rate: string;
  include_shipping: string;
  apply_tax_to: string;
  cities?: City[];
}

const stateOptions: Record<string, string> = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
};

export default function TaxListPage() {
  const [tables, setTables] = useState<TaxTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tax/tables');
      const data = res.data.data || [];
      setTables(data);

      // Initialize form data
      const initial: Record<string, any> = {};
      data.forEach((table: TaxTable) => {
        initial[`state_rate_${table.id}`] = table.state_rate;
        initial[`include_shipping_${table.id}`] = table.include_shipping === 'y';
        initial[`apply_tax_to_${table.id}`] = table.apply_tax_to || 'ship';
        if (table.cities) {
          table.cities.forEach((city) => {
            initial[`city_rate_${city.id}`] = city.city_rate;
            initial[`county_rate_${city.id}`] = city.county_rate;
            initial[`local_rate_${city.id}`] = city.local_rate;
          });
        }
      });
      setFormData(initial);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tax tables');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (stateId: string) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateId)) {
      newExpanded.delete(stateId);
    } else {
      newExpanded.add(stateId);
    }
    setExpandedStates(newExpanded);
  };

  const handleDelete = async (tableId: string) => {
    if (!window.confirm('Delete this tax table?')) return;
    try {
      await api.delete(`/tax/tables/${tableId}`);
      fetchTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tax table');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tax/tables/update', formData);
      alert('Tax tables updated successfully');
      fetchTables();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tax tables');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading tax tables...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Tax Tables</h1>
          <p><i className="fa fa-info-circle"></i> Manage your tax tables to set rates at the state, county, city, and local levels.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <p>
        <Link href="/dashboard/tax/add" className="btn btn-primary btn-sm"><i className="fa fa-plus"></i> Add Tax Tables</Link>
      </p>
      <br />

      <form onSubmit={handleSubmit}>
        <input type="submit" id="topBtn" disabled className="btn btn-primary" value="Submit" style={{ marginBottom: '20px' }} />
        <br />
        <br />

        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped">
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
                    {tables.length > 0 ? tables.map((table) => (
                      <React.Fragment key={table.id}>
                        <tr>
                          <td colSpan={5}>
                            <table style={{ width: '100%' }}>
                              <tbody>
                                <tr>
                                  <td>
                                    <button
                                      type="button"
                                      onClick={() => toggleExpanded(table.id)}
                                      style={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                      <i
                                        className={`fa ${expandedStates.has(table.id) ? 'fa-minus-square' : 'fa-plus-square'}`}
                                        style={{ marginRight: '8px' }}
                                      ></i>
                                    </button>
                                    {stateOptions[table.state] || table.state}
                                  </td>
                                  <td style={{ width: '15%' }}>
                                    <input
                                      type="text"
                                      className="form-control form-control-inline"
                                      size={5}
                                      value={formData[`state_rate_${table.id}`] || ''}
                                      onChange={(e) => setFormData({ ...formData, [`state_rate_${table.id}`]: e.target.value })}
                                    />
                                  </td>
                                  <td style={{ width: '15%', textAlign: 'center' }}>&nbsp;</td>
                                  <td style={{ width: '15%', textAlign: 'center' }}>&nbsp;</td>
                                  <td style={{ width: '10%', textAlign: 'center' }}>
                                    <input type="checkbox" name="delete_state[]" value={table.id} />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <table style={{ width: '100%' }}>
                              <tbody>
                                <tr>
                                  <td style={{ textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      name={`include_shipping_${table.id}`}
                                      checked={formData[`include_shipping_${table.id}`] || false}
                                      onChange={(e) => setFormData({ ...formData, [`include_shipping_${table.id}`]: e.target.checked })}
                                    />
                                    {' '}include shipping
                                  </td>
                                  <td colSpan={4}>
                                    apply tax to{' '}
                                    <select
                                      name={`apply_tax_to_${table.id}`}
                                      className="form-control form-control-inline"
                                      value={formData[`apply_tax_to_${table.id}`] || 'ship'}
                                      onChange={(e) => setFormData({ ...formData, [`apply_tax_to_${table.id}`]: e.target.value })}
                                    >
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
                        {expandedStates.has(table.id) && table.cities && (
                          <tr>
                            <td colSpan={5}>
                              {table.cities.map((city) => (
                                <table key={city.id} className="table table-striped" style={{ width: '100%', marginBottom: '10px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: '45%' }}>
                                        <i className="fa fa-folder" style={{ marginRight: '8px' }}></i>
                                        <i className="fa fa-folder" style={{ marginRight: '8px' }}></i>
                                        {city.city}
                                      </td>
                                      <td style={{ width: '15%' }}>
                                        <input
                                          type="text"
                                          className="form-control form-control-inline"
                                          size={5}
                                          value={formData[`city_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`city_rate_${city.id}`]: e.target.value })}
                                        />
                                      </td>
                                      <td style={{ width: '15%', textAlign: 'center' }}>
                                        <input
                                          type="text"
                                          className="form-control form-control-inline"
                                          size={5}
                                          value={formData[`county_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`county_rate_${city.id}`]: e.target.value })}
                                        />
                                      </td>
                                      <td style={{ width: '15%', textAlign: 'center' }}>
                                        <input
                                          type="text"
                                          className="form-control form-control-inline"
                                          size={5}
                                          value={formData[`local_rate_${city.id}`] || ''}
                                          onChange={(e) => setFormData({ ...formData, [`local_rate_${city.id}`]: e.target.value })}
                                        />
                                      </td>
                                      <td style={{ width: '10%', textAlign: 'center' }}>
                                        <input type="checkbox" name="delete[]" value={city.id} />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ))}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr><td colSpan={5} className="text-center">No tax tables found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <input type="submit" value="Submit" className="btn btn-primary" style={{ marginTop: '20px' }} />
          </div>
        </div>
      </form>
    </div>
  );
}
