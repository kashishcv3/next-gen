'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AccountInfo {
  username: string;
  co_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  timestamp: string;
  remote_ip: string;
  browser: string;
  uid: string;
}

interface Store {
  id: string;
  name: string;
}

export default function AccountInfoPage() {
  const router = useRouter();
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form data for bigadmin
  const [formData, setFormData] = useState({
    coName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    newPassword: '',
    unlockAccount: false,
    unlockWebsvc: false,
    unlockWebsvcStores: [] as string[],
    resetWebsvc: false,
    resetWebsvcStores: [] as string[],
  });

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account/info');
      const data = response.data.data;

      if (!data) {
        setError('Invalid Input');
        return;
      }

      setInfo(data);

      // Fetch user type
      const userResponse = await api.get('/account/user-info');
      setUserType(userResponse.data.data?.user_type || '');

      // Fetch stores if bigadmin
      if (userResponse.data.data?.user_type === 'bigadmin' || userResponse.data.data?.user_type === 'bigadmin_limit') {
        const storesResponse = await api.get('/account/stores');
        setStores(storesResponse.data.data || []);
      }

      // Initialize form data
      setFormData(prev => ({
        ...prev,
        coName: data.co_name || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch account info');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStoreSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: 'unlockWebsvcStores' | 'resetWebsvcStores') => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [field]: selectedOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        uid: info?.uid,
        co_name: formData.coName,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.newPassword || undefined,
        unlock_account: formData.unlockAccount ? 'y' : undefined,
        unlock_websvc: formData.unlockWebsvc ? 'y' : undefined,
        unlock_websvc_stores: formData.unlockWebsvcStores,
        reset_websvc: formData.resetWebsvc ? 'y' : undefined,
        reset_websvc_stores: formData.resetWebsvcStores,
      };

      await api.post('/account/info', payload);
      router.push('/account/manage');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update account info');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <h1>Account Information</h1>
          <div className="alert alert-danger">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isBigAdmin = userType === 'bigadmin' || userType === 'bigadmin_limit';

  return (
    <div>
      <br />
      <br />
      <form onSubmit={handleSubmit} method="post">
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th colSpan={isBigAdmin ? 3 : 2}>User Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td width="25%">Username</td>
                      <td width="25%">{info?.username}</td>
                      {isBigAdmin && (
                        <td width="50%">
                          <input type="hidden" name="uid" value={info?.uid} />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>Company</td>
                      <td>{info?.co_name}</td>
                      {isBigAdmin && (
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-inline"
                            name="coName"
                            value={formData.coName}
                            onChange={handleInputChange}
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>First Name</td>
                      <td>{info?.first_name}</td>
                      {isBigAdmin && (
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-inline"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>Last Name</td>
                      <td>{info?.last_name}</td>
                      {isBigAdmin && (
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-inline"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>Email</td>
                      <td>{info?.email}</td>
                      {isBigAdmin && (
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-inline"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>Phone</td>
                      <td>{info?.phone}</td>
                      {isBigAdmin && (
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-inline"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </td>
                      )}
                    </tr>

                    <tr>
                      <td>Date Created</td>
                      <td colSpan={isBigAdmin ? 2 : 1}>{info?.timestamp}</td>
                    </tr>

                    <tr>
                      <td>Remote IP</td>
                      <td colSpan={isBigAdmin ? 2 : 1}>{info?.remote_ip}</td>
                    </tr>

                    <tr>
                      <td>Browser</td>
                      <td colSpan={isBigAdmin ? 2 : 1}>{info?.browser}</td>
                    </tr>

                    {isBigAdmin && (
                      <>
                        <tr>
                          <td colSpan={2}>New password</td>
                          <td>
                            <input
                              type="password"
                              className="form-control form-control-inline"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                            />
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={2} style={{ textAlign: 'right' }}>
                            <input
                              type="checkbox"
                              name="unlockAccount"
                              id="account_unlock"
                              checked={formData.unlockAccount}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <label htmlFor="account_unlock" style={{ cursor: 'pointer', margin: 0 }}>
                              Reset lockout count
                            </label>
                          </td>
                        </tr>

                        {stores.length > 0 && (
                          <>
                            <tr>
                              <td colSpan={2}>
                                <input
                                  type="checkbox"
                                  name="unlockWebsvc"
                                  id="websvc_unlock"
                                  checked={formData.unlockWebsvc}
                                  onChange={handleInputChange}
                                />
                                <b>Reset Webservice REST Edition Lockout</b>
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  style={{ width: 'auto' }}
                                  multiple
                                  size={10}
                                  value={formData.unlockWebsvcStores}
                                  onChange={(e) => handleStoreSelect(e, 'unlockWebsvcStores')}
                                >
                                  {stores.map(store => (
                                    <option key={store.id} value={store.id}>
                                      {store.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>

                            <tr>
                              <td colSpan={2}>
                                <input
                                  type="checkbox"
                                  name="resetWebsvc"
                                  id="websvc_reset"
                                  checked={formData.resetWebsvc}
                                  onChange={handleInputChange}
                                />
                                <b>Reset Webservice REST Edition Credentials</b>
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  style={{ width: 'auto' }}
                                  multiple
                                  size={10}
                                  value={formData.resetWebsvcStores}
                                  onChange={(e) => handleStoreSelect(e, 'resetWebsvcStores')}
                                >
                                  {stores.map(store => (
                                    <option key={store.id} value={store.id}>
                                      {store.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          </>
                        )}

                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                          <td>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={submitting}
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
