'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PreferencesPage() {
  const [profile, setProfile] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    support_email: '',
  });
  const [passwords, setPasswords] = useState({
    pw: '',
    pw1: '',
    pw2: '',
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSwitch, setMfaSwitch] = useState('disable');
  const [mfaType, setMfaType] = useState('email_based');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uid, setUid] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/accounts/preferences/0');
      const data = res.data;
      setProfile({
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        support_email: data.support_email || '',
      });
      setUid(data.uid || '');
      if (data.mfa) {
        const mfaIsSet = data.mfa.is_mfa_set === 'y' || data.mfa.switch === 'enable';
        setMfaSwitch(mfaIsSet ? 'enable' : 'disable');
        setMfaType(data.mfa.mfa_type || 'email_based');
        setResetCode(data.mfa.onetime_reset_code || '');
        setMfaEnabled(mfaIsSet);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError('Failed to load preferences');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/accounts/update-profile', {
        ...profile,
        user_id: uid,
      });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (passwords.pw1 !== passwords.pw2) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.post('/accounts/change-password', {
        ...passwords,
        user_id: uid,
      });
      setSuccess('Password changed successfully');
      setPasswords({ pw: '', pw1: '', pw2: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      await api.post('/accounts/mfa-settings', {
        mfa_switch: mfaSwitch,
        type_of_mfa: mfaType,
        one_time_reset_code: resetCode,
        user_id: uid,
      });
      setSuccess('MFA settings updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update MFA settings');
    }
  };

  const generateResetCode = () => {
    const code = Math.random().toString().substring(2, 8);
    setResetCode(code);
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Preferences</h1>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <form onSubmit={handleProfileSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Profile Settings</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" disabled value={profile.username} />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="form-control" maxLength={50} value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="form-control" maxLength={50} value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="text" className="form-control" maxLength={50} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="form-control" maxLength={50} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Support Email</label>
                  <input type="text" className="form-control" maxLength={50} value={profile.support_email} onChange={(e) => setProfile({ ...profile, support_email: e.target.value })} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-save"></i> Update
            </button>
          </div>
        </div>
      </form>

      <br /><br />

      {/* Multi-Factor Authentication */}
      <form onSubmit={handleMfaSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Multi-Factor Authentication</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn btn-primary ${mfaSwitch === 'enable' ? 'active' : ''}`}
                      onClick={() => setMfaSwitch('enable')}
                    >
                      Enable
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className={`btn btn-primary ${mfaSwitch === 'disable' ? 'active' : ''}`}
                      onClick={() => setMfaSwitch('disable')}
                    >
                      Disable
                    </button>
                  </div>
                </div>

                {mfaSwitch === 'enable' && (
                  <>
                    <div className="form-group">
                      <label>To enable please choose between email or auth based MFA.</label>
                      <div className="btn-group">
                        <button
                          type="button"
                          className={`btn btn-primary ${mfaType === 'email_based' ? 'active' : ''}`}
                          onClick={() => setMfaType('email_based')}
                        >
                          Email based MFA
                        </button>
                        &nbsp;
                        <button
                          type="button"
                          className={`btn btn-primary ${mfaType === 'auth_based' ? 'active' : ''}`}
                          onClick={() => setMfaType('auth_based')}
                        >
                          Auth code based MFA
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>One Time Reset Code</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={resetCode}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '5px' }}
                        onClick={generateResetCode}
                      >
                        Generate Reset Code
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-shield"></i> Update MFA Settings
            </button>
          </div>
        </div>
      </form>

      <br /><br />

      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Change Password</h3>
              </div>
              <div className="panel-body">
                <p><span className="label label-warning">Note</span> Password must include at least one lowercase letter, one uppercase letter, one number and one special character and have a minimum of 12 characters. Passwords expire every 90 days for PCI Compliance.</p>
                <br />
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" disabled value={profile.username} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" maxLength={50} value={passwords.pw} onChange={(e) => setPasswords({ ...passwords, pw: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" maxLength={50} value={passwords.pw1} onChange={(e) => setPasswords({ ...passwords, pw1: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="form-control" maxLength={50} value={passwords.pw2} onChange={(e) => setPasswords({ ...passwords, pw2: e.target.value })} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-key"></i> Change Password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
