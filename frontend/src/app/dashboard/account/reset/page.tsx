'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AccountResetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

      await api.post('/account/reset-password', {
        password: formData.password,
      });

      router.push('/account/reset-finish');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Account Reset Password
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>
                    New Password
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
                  <label>Confirm New Password</label>
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
              </div>
            </div>

            <p>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
