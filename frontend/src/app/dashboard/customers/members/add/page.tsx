'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  title: string;
  billing_address1: string;
  billing_address2: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
  phone: string;
  pw1: string;
  pw2: string;
  ext_info: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    title: '',
    billing_address1: '',
    billing_address2: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    billing_country: '',
    phone: '',
    pw1: '',
    pw2: '',
    ext_info: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.pw1 || formData.pw2) {
      if (formData.pw1 !== formData.pw2) {
        newErrors.pw_match = 'Passwords do not match';
      }
      if (formData.pw1.length < 6) {
        newErrors.pw1 = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors below and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get site_id from localStorage, default to 93
      const stored = localStorage.getItem('current_store');
      const siteId = stored ? JSON.parse(stored).siteId : 93;

      // Prepare payload - only include fields that have values or are required
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company,
        title: formData.title,
        billing_address1: formData.billing_address1,
        billing_address2: formData.billing_address2,
        billing_city: formData.billing_city,
        billing_state: formData.billing_state,
        billing_zip: formData.billing_zip,
        billing_country: formData.billing_country,
        phone: formData.phone,
        pw1: formData.pw1,
        pw2: formData.pw2,
        ext_info: formData.ext_info,
      };

      const response = await api.post(
        `/customers/members/add?site_id=${siteId}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          company: '',
          title: '',
          billing_address1: '',
          billing_address2: '',
          billing_city: '',
          billing_state: '',
          billing_zip: '',
          billing_country: '',
          phone: '',
          pw1: '',
          pw2: '',
          ext_info: '',
        });
      }
    } catch (err: any) {
      console.error('Failed to add member:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add member. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess(false);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      company: '',
      title: '',
      billing_address1: '',
      billing_address2: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      billing_country: '',
      phone: '',
      pw1: '',
      pw2: '',
      ext_info: '',
    });
  };

  const handleBackToSearch = () => {
    router.push('/dashboard/customers/members/search');
  };

  // Success message display
  if (success) {
    return (
      <div>
        {/* Header */}
        <div className="row">
          <div className="col-lg-12">
            <h1>Member Added Successfully</h1>
          </div>
        </div>
        <br />

        {/* Success Alert */}
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success alert-dismissible" role="alert">
              <strong>Success!</strong> The member has been added successfully.
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="row">
          <div className="col-lg-12">
            <button
              className="btn btn-success"
              onClick={handleAddAnother}
              style={{ marginRight: '10px' }}
            >
              <i className="fa fa-plus"></i> Add Another Member
            </button>
            <button className="btn btn-default" onClick={handleBackToSearch}>
              <i className="fa fa-arrow-left"></i> Back to Member Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Member</h1>
          <p>Use this form to add a new member to the system.</p>
        </div>
      </div>
      <br />

      {/* Navigation Buttons */}
      <p>
        <Link href="/dashboard/customers/members/search" className="btn btn-primary btn-sm">
          <i className="fa fa-arrow-left"></i> Member Search
        </Link>
      </p>
      <br />

      {/* Error Alert */}
      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="fa fa-cogs"></i> Add Member
              </h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="form-group">
                  <label>
                    Email:
                    {!errors.email && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <span className="help-block">{errors.email}</span>
                  )}
                </div>

                {/* First Name */}
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Company */}
                <div className="form-group">
                  <label>Company:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Title */}
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Billing Address */}
                <div className="form-group">
                  <label>Billing Address:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="billing_address1"
                    placeholder="Address Line 1"
                    value={formData.billing_address1}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="billing_address2"
                    placeholder="Address Line 2"
                    value={formData.billing_address2}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* City and State (Two Column) */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Billing City:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="billing_city"
                        value={formData.billing_city}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Billing State:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="billing_state"
                        value={formData.billing_state}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., CA, NY"
                      />
                    </div>
                  </div>
                </div>

                {/* Zip and Country (Two Column) */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Billing Zip:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="billing_zip"
                        value={formData.billing_zip}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Billing Country:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="billing_country"
                        value={formData.billing_country}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Additional Information */}
                <div className="form-group">
                  <label>Additional Information:</label>
                  <textarea
                    className="form-control"
                    name="ext_info"
                    value={formData.ext_info}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ height: '100px', resize: 'vertical' }}
                  />
                </div>

                {/* Password Fields */}
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.pw1 ? 'is-invalid' : ''
                    }`}
                    name="pw1"
                    value={formData.pw1}
                    onChange={handleChange}
                    disabled={loading}
                    aria-invalid={!!errors.pw1}
                  />
                  {errors.pw1 && (
                    <span className="help-block">{errors.pw1}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.pw_match ? 'is-invalid' : ''
                    }`}
                    name="pw2"
                    value={formData.pw2}
                    onChange={handleChange}
                    disabled={loading}
                    aria-invalid={!!errors.pw_match}
                  />
                  {errors.pw_match && (
                    <span className="help-block">{errors.pw_match}</span>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Buttons */}
          <div className="row">
            <div className="col-lg-12">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginRight: '10px' }}
              >
                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                {loading ? ' Adding Member...' : ' Add Member'}
              </button>
              <Link href="/dashboard/customers/members/search" className="btn btn-default">
                <i className="fa fa-times"></i> Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
