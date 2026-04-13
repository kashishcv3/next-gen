'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  supportEmail: string;
  username: string;
  password: string;
  confirmPassword: string;
  hint: string;
  accountType: string;
}

export default function AccountCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    supportEmail: '',
    username: '',
    password: '',
    confirmPassword: '',
    hint: '',
    accountType: 'merchant',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockAddUsers, setLockAddUsers] = useState(false);
  const [showAccountTypeRadios, setShowAccountTypeRadios] = useState(true);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/account/user-info');
      const data = response.data.data;
      setUserType(data?.user_type || '');
      setLockAddUsers(data?.lock_add_users === 'y');

      if (data?.user_type === 'bigadmin' || data?.user_type === 'bigadmin_limit') {
        setFormData(prev => ({ ...prev, accountType: 'developer' }));
        setShowAccountTypeRadios(false);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      accountType: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        co_name: formData.company,
        email: formData.email,
        phone: formData.phone,
        support: formData.supportEmail,
        username: formData.username,
        password: formData.password,
        hint: formData.hint,
        acct_type: formData.accountType,
      };

      await api.post('/account/create', payload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (lockAddUsers) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <h1>Create An Account</h1>
          <div className="alert alert-danger">
            <span className="label label-danger">Note</span> Account creation is disabled at this time.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Create An Account</h1>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <p>
              <i className="fa fa-info-circle"></i> Complete all fields of the form below. Be sure to record your username
              and password for future reference.
            </p>

            {/* Contact Information Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Contact Information
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                {showAccountTypeRadios && (
                  <div className="form-group">
                    <label>Support Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="supportEmail"
                      value={formData.supportEmail}
                      onChange={handleInputChange}
                      maxLength={50}
                    />
                    <span className="help-block">Developers Only</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* Account Information Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Account Information
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password
                    <small>
                      &nbsp; Password must include at least one lowercase letter, one uppercase letter, one number and
                      one special character and have a minimum of 12 characters. Passwords expire every 90 days for PCI
                      Compliance.
                    </small>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hint</label>
                  <input
                    type="text"
                    className="form-control"
                    name="hint"
                    value={formData.hint}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* Account Type Panel */}
            {showAccountTypeRadios && (
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <i className="fa fa-cogs"></i> Type of Account
                  </h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        name="accountType"
                        value="merchant"
                        checked={formData.accountType === 'merchant'}
                        onChange={() => handleRadioChange('merchant')}
                      />{' '}
                      Merchant Account (you would like to create your own stores)
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="radio"
                        name="accountType"
                        value="developer"
                        checked={formData.accountType === 'developer'}
                        onChange={() => handleRadioChange('developer')}
                      />{' '}
                      Developer Account (you would like to create stores for others)
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
