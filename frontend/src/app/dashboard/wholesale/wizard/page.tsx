'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WholesaleWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    status: 'active',
    discount_rate: 0,
    payment_terms: 'net30',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await api.post('/wholesale', formData);
      router.push('/wholesale/list');
    } catch (err) {
      console.error('Failed to create wholesale:', err);
      setError('Failed to create wholesale customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Wholesale Customer Setup Wizard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Step Indicator */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block' }}>
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    style={{
                      display: 'inline-block',
                      width: '40px',
                      height: '40px',
                      lineHeight: '40px',
                      textAlign: 'center',
                      backgroundColor: step === s ? '#5cb85c' : step > s ? '#5cb85c' : '#ddd',
                      color: 'white',
                      borderRadius: '50%',
                      fontWeight: 'bold',
                    }
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      style={{
                        display: 'inline-block',
                        width: '40px',
                        height: '3px',
                        backgroundColor: step > s ? '#5cb85c' : '#ddd',
                        marginBottom: '18px',
                      }
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Address & Status' : 'Review & Confirm'}
          </div>
        </div>
      </div>

      <div className="panel panel-default">
        <div className="panel-body">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div>
              <h3>Basic Information</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="company_name">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="contact_name">Contact Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address & Status */}
          {step === 2 && (
            <div>
              <h3>Address & Status</h3>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      className="form-control"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="postal_code">Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      className="form-control"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h3>Review Your Information</h3>
              <div className="alert alert-info">Please review the information below before submitting.</div>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '200px' }}>Company Name:</td>
                    <td>{formData.company_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Contact Name:</td>
                    <td>{formData.contact_name}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Email:</td>
                    <td>{formData.email}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Phone:</td>
                    <td>{formData.phone}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Address:</td>
                    <td>{formData.address}, {formData.city}, {formData.state} {formData.postal_code}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Status:</td>
                    <td>{formData.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            {step > 1 && (
              <button className="btn btn-default" onClick={handlePrev} style={{ marginRight: '10px' }}>
                <i className="fa fa-arrow-left"></i> Previous
              </button>
            )}

            {step < 3 && (
              <button className="btn btn-primary" onClick={handleNext}>
                Next <i className="fa fa-arrow-right"></i>
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-check"></i> {loading ? 'Creating...' : 'Create Wholesale'}
                </button>
                <Link href="/wholesale/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                  Cancel
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
