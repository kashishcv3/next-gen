'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

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
  birthdate: string;
  points_earned: number;
  points_redeemed: number;
  ext_info: string;
  password: string;
  remove_member: boolean;
  memberlink: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface MemberData {
  user_id: string;
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
  birthdate: string;
  points_earned: number;
  points_redeemed: number;
  ext_info: string;
  active: boolean;
}

export default function EditMemberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { siteId } = useStore();

  const memberId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rewardsEnabled, setRewardsEnabled] = useState(false);

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
    birthdate: '',
    points_earned: 0,
    points_redeemed: 0,
    ext_info: '',
    password: '',
    remove_member: false,
    memberlink: false,
  });

  // Fetch member data on mount
  useEffect(() => {
    if (!memberId || !siteId) {
      setLoading(false);
      if (!memberId) {
        setError('Member ID not provided in URL');
      }
      if (!siteId) {
        setError('Site ID not available. Please select a site.');
      }
      return;
    }

    fetchMemberData();
  }, [memberId, siteId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/customers/members/${memberId}?site_id=${siteId}`);
      const memberData: MemberData = response.data.user;

      // Determine if rewards are enabled based on presence of points data
      const hasRewardsData =
        memberData.points_earned !== undefined ||
        memberData.points_redeemed !== undefined;
      if (hasRewardsData) {
        setRewardsEnabled(true);
      }

      // Populate form with fetched data
      setFormData({
        email: memberData.email || '',
        first_name: memberData.first_name || '',
        last_name: memberData.last_name || '',
        company: memberData.company || '',
        title: memberData.title || '',
        billing_address1: memberData.billing_address1 || '',
        billing_address2: memberData.billing_address2 || '',
        billing_city: memberData.billing_city || '',
        billing_state: memberData.billing_state || '',
        billing_zip: memberData.billing_zip || '',
        billing_country: memberData.billing_country || '',
        phone: memberData.phone || '',
        birthdate: memberData.birthdate || '',
        points_earned: memberData.points_earned || 0,
        points_redeemed: memberData.points_redeemed || 0,
        ext_info: memberData.ext_info || '',
        password: '',
        remove_member: !memberData.active,
        memberlink: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch member data:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load member data. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBirthdateChange = (part: 'month' | 'day' | 'year', value: string) => {
    // Parse current birthdate or create new one
    const parts = formData.birthdate ? formData.birthdate.split('-') : ['', '', ''];

    if (part === 'month') {
      parts[0] = value.padStart(2, '0');
    } else if (part === 'day') {
      parts[1] = value.padStart(2, '0');
    } else if (part === 'year') {
      parts[2] = value;
    }

    // Only update if we have all parts
    const newBirthdate = parts.every(p => p) ? parts.join('-') : '';
    setFormData((prev) => ({
      ...prev,
      birthdate: newBirthdate,
    }));
  };

  const parseBirthdate = () => {
    if (!formData.birthdate) {
      return { month: '', day: '', year: '' };
    }
    const parts = formData.birthdate.split('-');
    return {
      month: parts[0] || '',
      day: parts[1] || '',
      year: parts[2] || '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors below and try again.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare payload
      const payload: any = {
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
        ext_info: formData.ext_info,
        remove_member: formData.remove_member,
        memberlink: formData.memberlink,
      };

      // Only include birthdate if set
      if (formData.birthdate) {
        payload.birthdate = formData.birthdate;
      }

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      // Only include rewards if enabled
      if (rewardsEnabled) {
        payload.points_earned = formData.points_earned;
        payload.points_redeemed = formData.points_redeemed;
      }

      const response = await api.post(
        `/customers/members/${memberId}?site_id=${siteId}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess('Member updated successfully');
        // Optionally refetch to ensure fresh data
        setTimeout(() => {
          fetchMemberData();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to update member:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update member. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!memberId) {
    return (
      <div>
        <div className="row">
          <div className="col-lg-12">
            <h1>Edit Member</h1>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger alert-dismissible" role="alert">
              <strong>Error:</strong> No member ID provided. Please use the member search page to select a member.
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Link href="/dashboard/customers/members/search" className="btn btn-primary">
              <i className="fa fa-arrow-left"></i> Back to Member Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="row">
          <div className="col-lg-12">
            <h1>Edit Member</h1>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info">
              <i className="fa fa-spinner fa-spin"></i> Loading member data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { month, day, year } = parseBirthdate();

  return (
    <div>
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Edit Member</h1>
        </div>
      </div>
      <br />

      {/* Back to Member Search Link */}
      <div className="row">
        <div className="col-lg-12">
          <Link href="/dashboard/customers/members/search" className="btn btn-primary btn-sm">
            <i className="fa fa-arrow-left"></i> Back to Member Search
          </Link>
        </div>
      </div>
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

      {/* Success Alert */}
      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setSuccess(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <strong>Success!</strong> {success}
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
                <i className="fa fa-user"></i> Member Information
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
                    disabled={saving}
                    aria-invalid={!!errors.email}
                  />
                  <small className="form-text text-muted">
                    Changing a member's email address will change their marketing list email as well
                  </small>
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </div>

                {/* Remove Member Checkbox */}
                <div className="form-group">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="remove_member"
                        checked={formData.remove_member}
                        onChange={handleChange}
                        disabled={saving}
                      />
                      Remove Member (removes from membership)
                    </label>
                  </div>
                </div>

                {/* Member Link Checkbox */}
                <div className="form-group">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="memberlink"
                        checked={formData.memberlink}
                        onChange={handleChange}
                        disabled={saving}
                      />
                      Member Link
                    </label>
                  </div>
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
                    disabled={saving}
                    style={{ marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    name="billing_address2"
                    placeholder="Address Line 2"
                    value={formData.billing_address2}
                    onChange={handleChange}
                    disabled={saving}
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
                        disabled={saving}
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
                        disabled={saving}
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
                        disabled={saving}
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
                        disabled={saving}
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
                    disabled={saving}
                  />
                </div>

                {/* Birthdate (3 Dropdowns) */}
                <div className="form-group">
                  <label>Birthdate:</label>
                  <div className="row">
                    <div className="col-md-4">
                      <select
                        className="form-control"
                        value={month}
                        onChange={(e) => handleBirthdateChange('month', e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-control"
                        value={day}
                        onChange={(e) => handleBirthdateChange('day', e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-control"
                        value={year}
                        onChange={(e) => handleBirthdateChange('year', e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 100 }, (_, i) => {
                          const y = new Date().getFullYear() - i;
                          return (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rewards Points (Conditional) */}
                {rewardsEnabled && (
                  <>
                    <div className="form-group">
                      <label>Rewards Points Earned:</label>
                      <input
                        type="number"
                        className="form-control"
                        name="points_earned"
                        value={formData.points_earned}
                        onChange={handleChange}
                        disabled={saving}
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Rewards Points Redeemed:</label>
                      <input
                        type="number"
                        className="form-control"
                        name="points_redeemed"
                        value={formData.points_redeemed}
                        onChange={handleChange}
                        disabled={saving}
                        min="0"
                      />
                    </div>
                  </>
                )}

                {/* Additional Information */}
                <div className="form-group">
                  <label>Additional Information:</label>
                  <textarea
                    className="form-control"
                    name="ext_info"
                    value={formData.ext_info}
                    onChange={handleChange}
                    disabled={saving}
                    style={{ height: '100px', resize: 'vertical' }}
                  />
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Leave blank to keep current password"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <span className="help-block">{errors.password}</span>
                  )}
                  <small className="form-text text-muted">
                    Leave blank to keep the current password
                  </small>
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
                disabled={saving}
                style={{ marginRight: '10px' }}
              >
                <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                {saving ? ' Updating Member...' : ' Update Member'}
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
