'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Store {
  id: number;
  name: string;
  display_name: string;
  is_live: string;
  status: string;
  domain: string;
  in_cloud: string;
  date_created: string;
  no_activity: string;
  visitors: number;
  orders: number;
  revenue: string;
}

interface SubUser {
  username: string;
  co_name: string;
  user_type: string;
  last_login: string;
}

interface SubStore {
  id: number;
  name: string;
  display_name: string;
  status: string;
  in_cloud: string;
  date_created: string;
  no_activity: string;
}

interface MainpageData {
  uid: number;
  username: string;
  co_name: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  devel: boolean;
  companies: {
    my_stores: Store[];
    users: Record<string, SubUser>;
    other_stores: Record<string, SubStore[]>;
    other_users: Record<string, SubUser>;
  };
  login_messages: Record<string, string>;
}

export default function MainpagePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MainpageData | null>(null);

  useEffect(() => {
    fetchMainpageData();
  }, [uid]);

  const fetchMainpageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/mainpage/${uid}`);
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching mainpage:', err);
      setError(err.response?.data?.detail || 'Failed to load mainpage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info"><i className="fa fa-spinner fa-spin"></i> Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-warning">No data available</div>
      </div>
    );
  }

  const { companies, login_messages, devel } = data;
  const hasReportPerms = true; // TODO: check permissions
  const hasNoActivity = companies.my_stores.some(s => s.no_activity === 'y');

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>

      {/* Login Messages */}
      {login_messages && login_messages.ecms && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-warning" dangerouslySetInnerHTML={{ __html: login_messages.ecms }} />
          </div>
        </div>
      )}

      {/* Store List Header */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Store List</h1>
          <p>
            <i className="fa fa-info-circle"></i> The following is a complete list of the stores that you have permission to administer. To make changes and/or updates
            to a store, simply click on the name of the store. You can also{' '}
            <Link href="/dashboard/store/create">create a new store</Link>.
            <br /><br />
          </p>
        </div>
      </div>

      {/* My Stores Table */}
      <div className="row">
        <div className="col-lg-12">
          <div className="well well-cv3-table">
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>My Stores</th>
                    <th className="text-center">Display Name</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Date Created</th>
                    {hasReportPerms && (
                      <>
                        <th className="text-center">Today&apos;s Visitor Count</th>
                        <th className="text-center">Pending Orders</th>
                        <th className="text-center">Pending Revenue</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {companies.my_stores.length === 0 ? (
                    <tr>
                      <td colSpan={hasReportPerms ? 7 : 4} className="text-center">
                        No stores found.
                      </td>
                    </tr>
                  ) : (
                    companies.my_stores.map((store) => (
                      <tr key={store.id}>
                        <td>
                          <Link href={`/dashboard/links/${store.id}`}>{store.name}</Link>
                          {store.no_activity === 'y' && (
                            <span style={{ color: 'red' }}> Inactive</span>
                          )}
                        </td>
                        <td className="text-center">{store.display_name}</td>
                        <td className="text-center">{store.status}</td>
                        <td className="text-center">{store.date_created}</td>
                        {hasReportPerms && (
                          <>
                            <td className="text-center">{store.visitors}</td>
                            <td className="text-center">
                              <Link href={`/dashboard/orders/pending`}>{store.orders}</Link>
                            </td>
                            <td className="text-center">{store.revenue}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {companies.my_stores.length > 0 && hasReportPerms && (
            <p><Link href="/dashboard/reports/quick-stats" className="btn btn-primary btn-sm">View Quick Stats</Link></p>
          )}
        </div>
      </div>

      {/* My Merchants (developers only) */}
      {devel && Object.keys(companies.other_stores).length > 0 && (
        <>
          <br /><br />
          <div className="row">
            <div className="col-lg-12">
              <div className="well well-cv3-table">
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>My Merchants</th>
                        <th className="text-center">Display Name</th>
                        <th className="text-center">Date Created</th>
                        <th className="text-center">Last Login</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(companies.other_stores).map(([userId, stores]) => {
                        const userInfo = companies.users[userId];
                        if (!userInfo) return null;
                        return (
                          <React.Fragment key={userId}>
                            {/* User row */}
                            <tr>
                              <td>
                                <Link href={`/dashboard/account-info/${userId}`}>
                                  {userInfo.username} - {userInfo.co_name}
                                </Link>
                              </td>
                              <td className="text-center">&nbsp;</td>
                              <td className="text-center">&nbsp;</td>
                              <td className="text-center">{userInfo.last_login}</td>
                              <td>&nbsp;</td>
                            </tr>
                            {/* Store rows under this user */}
                            {stores.map((store) => (
                              <tr key={store.id}>
                                <td>
                                  &nbsp;&nbsp;&nbsp;&nbsp;
                                  <Link href={`/dashboard/links/${store.id}`}>{store.name}</Link>
                                  {store.no_activity === 'y' && (
                                    <> - <span style={{ color: 'red' }}>Inactive</span></>
                                  )}
                                </td>
                                <td className="text-center">{store.display_name}</td>
                                <td className="text-center">{store.date_created}</td>
                                <td>&nbsp;</td>
                                <td className="text-center">{store.status}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  {hasNoActivity && (
                    <>
                      <br />
                      <span className="normaltext" style={{ color: 'red' }}>
                        Notice: Your inactive stores will be removed if they remain inactive.
                      </span>
                    </>
                  )}
                </div>
              </div>
              {companies.my_stores.length > 0 && hasReportPerms && (
                <div>
                  <Link href="/dashboard/reports/quick-stats" className="btn btn-primary btn-sm">View Quick Stats</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Merchants With No Stores */}
      {Object.keys(companies.other_users).length > 0 && (
        <>
          <br /><br />
          <div className="row">
            <div className="col-lg-12">
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th colSpan={2}>Merchants With No Stores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(companies.other_users).map(([userId, userInfo]) => (
                      <tr key={userId}>
                        <td>
                          <Link href={`/dashboard/account-info/${userId}`}>
                            {userInfo.username} - {userInfo.co_name}
                          </Link>
                        </td>
                        <td className="text-right">
                          [ <Link href={`/dashboard/account-delete/${userInfo.username}`}>delete user</Link> ]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
