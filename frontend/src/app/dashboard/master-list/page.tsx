'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

interface Store {
  site_id: number;
  name: string;
  display_name: string;
  date_created: string;
  is_live: string;
  secure_domain: string;
  bill: string;
  bill_note: string;
  in_cloud: number;
}

interface Subuser {
  uid: number;
  username: string;
  user_type: string;
  co_name: string;
  stores: Store[];
}

interface Developer {
  uid: number;
  username: string;
  user_type: string;
  co_name: string;
  total_stores: number;
  stores: Store[];
  subusers: Subuser[];
}

interface MasterListData {
  developers: Developer[];
}

export default function MasterListPage() {
  const searchParams = useSearchParams();
  const display = searchParams.get('display') || '';

  const [data, setData] = useState<MasterListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterList = async () => {
      try {
        setLoading(true);
        const params = display ? { display } : {};
        const response = await api.get('/master-list', { params });
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMasterList();
  }, [display]);

  const isExpanded = (developerUid: number) => {
    return display === String(developerUid) || display === 'all';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Developer List</h1>
          <p>
            <i className="fa fa-info-circle"></i> The following is a complete list of the developers in the system. To make changes and/or updates to a store, simply click on the name of the developer.
          </p>
          <br />
          <p>
            <Link href="/dashboard/master-list?display=all" className="btn btn-primary btn-sm">
              Expand All Developers
            </Link>
            {' '}
            <Link href="/dashboard/master-list" className="btn btn-primary btn-sm">
              Collapse All Developers
            </Link>
          </p>
        </div>
      </div>

      <form name="master_list" method="post" action="/api/v1/master-list" role="form">
        <div className="row">
          <div className="col-lg-12">
            {data?.developers && data.developers.length > 0 ? (
              data.developers.map((developer) => (
                <div key={developer.uid} className="well well-cv3-table">
                  <div className="table-responsive">
                    <table className="table table-hover table-striped tablesorter cv3-data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>Users</th>
                          <th style={{ width: '30%' }} className="text-center">
                            Company Name
                          </th>
                          <th style={{ width: '10%' }} className="text-center">
                            Total Stores
                          </th>
                          <th style={{ width: '10%' }} className="text-center">
                            Date Created
                          </th>
                          <th style={{ width: '5%' }} className="text-center">
                            Bill
                          </th>
                          <th style={{ width: '15%' }} className="text-center">
                            Bill Note
                          </th>
                          <th style={{ width: '5%' }} className="text-center">
                            Change Log
                          </th>
                          <th style={{ width: '5%' }} className="text-center">
                            Total Users
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Developer Row */}
                        <tr>
                          <td>
                            <a href={`/admin/mainpage/${developer.uid}`}>{developer.username}</a>
                          </td>
                          <td className="text-center">{developer.co_name || ''}</td>
                          <td className="text-center">{developer.total_stores || 0}</td>
                          <td className="text-center">&nbsp;</td>
                          <td className="text-center">&nbsp;</td>
                          <td className="text-center">&nbsp;</td>
                          <td className="text-center">&nbsp;</td>
                          <td className="cv3-actions">
                            <center>
                              {developer.subusers.length === 0 ? (
                                <a
                                  href={`/admin/account_delete/0/${developer.username}`}
                                  className="delete-tooltip"
                                  title="Delete User"
                                >
                                  <i className="fa fa-trash-o"></i>
                                </a>
                              ) : (
                                developer.subusers.length
                              )}
                            </center>
                          </td>
                        </tr>

                        {/* Expanded Content */}
                        {isExpanded(developer.uid) ? (
                          <>
                            {/* Developer Stores */}
                            {developer.stores.map((store) => (
                              <tr key={`dev-store-${store.site_id}`}>
                                <td colSpan={1}>
                                  &nbsp;&nbsp;&nbsp;
                                  <a href={`/admin/links/${store.site_id}`}>{store.name}</a>
                                  {store.is_live === 'y' && (
                                    <>
                                      &nbsp;
                                      <a href={`http://${store.secure_domain}`} target="_blank" rel="noopener noreferrer">
                                        <i className="fa fa-globe"></i>
                                      </a>
                                    </>
                                  )}
                                </td>
                                <td colSpan={2}>{store.display_name}</td>
                                <td className="text-center">{formatDate(store.date_created)}</td>
                                {store.is_live !== 'y' ? (
                                  <>
                                    <td className="text-center">
                                      <input
                                        type="checkbox"
                                        name={`bill_${store.site_id}`}
                                        value="y"
                                        defaultChecked={store.bill === 'y'}
                                      />
                                      &nbsp;
                                      <input type="hidden" name={`bill_cur_${store.site_id}`} value={store.bill} />
                                      &nbsp;
                                      <input type="hidden" name={`site_${store.site_id}`} value={store.name} />
                                      &nbsp;
                                      <input type="hidden" name={`bill_note_cur_${store.site_id}`} value={store.bill_note || ''} />
                                    </td>
                                    <td className="text-center">
                                      <input
                                        type="text"
                                        name={`bill_note_${store.site_id}`}
                                        defaultValue={store.bill_note || ''}
                                      />
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="text-center">&nbsp;</td>
                                    <td className="text-center">&nbsp;</td>
                                  </>
                                )}
                                <td className="cv3-actions">
                                  <center>
                                    <a href={`/admin/store_changelog/${store.site_id}`} title="View Change Log">
                                      <i className="fa fa-history"></i>
                                    </a>
                                  </center>
                                </td>
                                <td className="cv3-actions">
                                  <center>
                                    <a
                                      href={`/admin/store_delete/${store.site_id}`}
                                      className="delete-tooltip"
                                      title="Delete Store"
                                    >
                                      <i className="fa fa-trash-o"></i>
                                    </a>
                                  </center>
                                </td>
                              </tr>
                            ))}

                            {/* Subusers */}
                            {developer.subusers.map((subuser) => (
                              <React.Fragment key={`subuser-${subuser.uid}`}>
                                {/* Subuser Row */}
                                <tr>
                                  <td>
                                    <a href={`/admin/account_info/0/${subuser.uid}`}>{subuser.username}</a>
                                  </td>
                                  <td className="text-center">{subuser.co_name || ''}</td>
                                  <td className="text-center">&nbsp;</td>
                                  <td className="text-center">&nbsp;</td>
                                  <td className="text-center">&nbsp;</td>
                                  <td className="text-center">&nbsp;</td>
                                  <td className="text-center">&nbsp;</td>
                                  <td className="cv3-actions">
                                    <center>
                                      {subuser.stores.length === 0 ? (
                                        <a
                                          href={`/admin/account_delete/0/${subuser.username}`}
                                          className="delete-tooltip"
                                          title="Delete User"
                                        >
                                          <i className="fa fa-trash-o"></i>
                                        </a>
                                      ) : (
                                        '\u00A0'
                                      )}
                                    </center>
                                  </td>
                                </tr>

                                {/* Subuser Stores */}
                                {subuser.stores.map((store) => (
                                  <tr key={`subuser-store-${store.site_id}`}>
                                    <td colSpan={1}>
                                      &nbsp;&nbsp;&nbsp;
                                      <a href={`/admin/links/${store.site_id}`}>{store.name}</a>
                                      {store.is_live === 'y' && (
                                        <>
                                          &nbsp;
                                          <a href={`http://${store.secure_domain}`} target="_blank" rel="noopener noreferrer">
                                            <i className="fa fa-globe"></i>
                                          </a>
                                        </>
                                      )}
                                    </td>
                                    <td colSpan={1} className="text-center">
                                      {store.display_name}
                                    </td>
                                    <td colSpan={1}></td>
                                    <td className="text-center">{formatDate(store.date_created)}</td>
                                    {store.is_live !== 'y' ? (
                                      <>
                                        <td className="text-center">
                                          <input
                                            type="checkbox"
                                            name={`bill_${store.site_id}`}
                                            value="y"
                                            defaultChecked={store.bill === 'y'}
                                          />
                                          &nbsp;
                                          <input type="hidden" name={`bill_cur_${store.site_id}`} value={store.bill} />
                                          &nbsp;
                                          <input type="hidden" name={`site_${store.site_id}`} value={store.name} />
                                          &nbsp;
                                          <input type="hidden" name={`bill_note_cur_${store.site_id}`} value={store.bill_note || ''} />
                                        </td>
                                        <td className="text-center">
                                          <input
                                            type="text"
                                            name={`bill_note_${store.site_id}`}
                                            defaultValue={store.bill_note || ''}
                                          />
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="text-center">&nbsp;</td>
                                        <td className="text-center">&nbsp;</td>
                                      </>
                                    )}
                                    <td className="cv3-actions">
                                      <center>
                                        <a href={`/admin/store_changelog/${store.site_id}`} title="View Change Log">
                                          <i className="fa fa-history"></i>
                                        </a>
                                      </center>
                                    </td>
                                    <td className="cv3-actions">
                                      <center>
                                        <a
                                          href={`/admin/store_delete/${store.site_id}`}
                                          className="delete-tooltip"
                                          title="Delete Store"
                                        >
                                          <i className="fa fa-trash-o"></i>
                                        </a>
                                      </center>
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </>
                        ) : (
                          /* Collapse Row */
                          <tr>
                            <td colSpan={8}>
                              <Link href={`/dashboard/master-list?display=${developer.uid}`}>
                                Click to Expand
                              </Link>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p>No developers found.</p>
            )}
          </div>
        </div>

        {display && (
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col-lg-12">
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
