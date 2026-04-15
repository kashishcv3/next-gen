'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';

interface Feature {
  name: string;
  build: string;
  title: string;
  description: string;
  date_entered: string;
  cost: string;
  link: string;
  info: string;
  noupgrade: string;
  live: string;
  dashboard: string;
  type: string;
  type_raw: string;
  prereqs: string[];
}

export default function StoreFeaturesPage() {
  const { siteId } = useStore();
  const { user } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureInfo, setFeatureInfo] = useState<Record<string, string>>({});
  const [currencyType, setCurrencyType] = useState('$');
  const [isBigadmin, setIsBigadmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstall, setSelectedInstall] = useState<string[]>([]);
  const [changevals, setChangevals] = useState<Record<string, string>>({});
  const [liveChecked, setLiveChecked] = useState<Record<string, boolean>>({});
  const [dashboardChecked, setDashboardChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (siteId) fetchFeatures();
  }, [siteId]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-features/list/${siteId}`);
      const data = res.data;
      setFeatures(data.features || []);
      setFeatureInfo(data.feature_info || {});
      setCurrencyType(data.currency_type || '$');
      setIsBigadmin(data.bigadmin === 'y');

      // Initialize live/dashboard checkboxes from features
      const liveInit: Record<string, boolean> = {};
      const dashInit: Record<string, boolean> = {};
      (data.features || []).forEach((f: Feature) => {
        liveInit[f.name] = f.live === 'y';
        dashInit[f.name] = f.dashboard === 'y';
      });
      setLiveChecked(liveInit);
      setDashboardChecked(dashInit);

      // Initialize changevals from feature_info
      const cvInit: Record<string, string> = {};
      Object.entries(data.feature_info || {}).forEach(([name, val]) => {
        if (val === '1' || val === '2') {
          cvInit[name] = val as string;
        }
      });
      setChangevals(cvInit);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallToggle = (name: string) => {
    setSelectedInstall(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // If bigadmin, update live/dashboard flags and changevals
      if (isBigadmin) {
        const liveNames = Object.entries(liveChecked).filter(([, v]) => v).map(([k]) => k);
        const dashNames = Object.entries(dashboardChecked).filter(([, v]) => v).map(([k]) => k);
        await api.post(`/store-features/update/${siteId}`, {
          live: liveNames,
          dashboard: dashNames,
          changevals: changevals,
        });
      }

      // If features selected for install, redirect to confirm
      if (selectedInstall.length > 0) {
        // Store in sessionStorage for confirm page
        sessionStorage.setItem('feature_install', JSON.stringify(selectedInstall));
        window.location.href = `/dashboard/store/features/confirm?site_id=${siteId}&names=${selectedInstall.join(',')}`;
        return;
      }

      // Reload if only bigadmin updates
      fetchFeatures();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCost = (feature: Feature) => {
    const cost = feature.cost;
    const noupgrade = feature.noupgrade;
    if (cost && !isNaN(Number(cost)) && Number(cost) > 0) {
      return `${currencyType}${Number(cost).toFixed(2)}`;
    } else if (cost && noupgrade !== 'y' && (Number(cost) > 0 || isNaN(Number(cost)))) {
      return cost;
    } else if (noupgrade === 'y' || cost === '0' || cost === '') {
      return 'Free';
    }
    return 'Free';
  };

  const renderStatusCell = (feature: Feature) => {
    const name = feature.name;
    const status = featureInfo[name] || '';

    if (feature.noupgrade === 'y') {
      return <>&nbsp;</>;
    }

    if (status === '1' || status === '2') {
      if (isBigadmin) {
        return (
          <select
            className="form-control"
            value={changevals[name] || status}
            onChange={(e) => setChangevals(prev => ({ ...prev, [name]: e.target.value }))}
          >
            <option value="1">Requested</option>
            <option value="2">Complete</option>
          </select>
        );
      } else if (status === '1') {
        return <span style={{ color: '#cc0000' }}>Upgrade Requested</span>;
      } else {
        return <span style={{ color: '#cc0000' }}>Upgrade Complete</span>;
      }
    }

    return (
      <input
        type="checkbox"
        checked={selectedInstall.includes(name)}
        onChange={() => handleInstallToggle(name)}
      />
    );
  };

  const openInfoPopup = (name: string) => {
    window.open(
      `/dashboard/store/features/info?name=${encodeURIComponent(name)}`,
      '_popup',
      'width=500,height=500,scrollbars=yes'
    );
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>New Features</h1>
        </div>
      </div>
      <br />

      {isBigadmin && (
        <p>
          <Link className="btn btn-primary btn-sm" href={`/dashboard/store/features/edit`}>
            Add New Feature
          </Link>
        </p>
      )}
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <p className="help-block">
              <i className="fa fa-info-circle"></i>{' '}
              The following features require a template upgrade. Check the features you would like
              to use and your templates will be upgraded at the price listed.
            </p>
            <button
              type="submit"
              disabled={submitting || (selectedInstall.length === 0 && !isBigadmin)}
              className="btn btn-primary"
            >
              Submit Upgrade Request
            </button>
            <br /><br />

            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>&nbsp;</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Cost</th>
                      {isBigadmin && (
                        <>
                          <th>Edit</th>
                          <th>Live</th>
                          <th>Dashboard</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {features.map(feature => {
                      // Non-bigadmin only sees live features
                      if (feature.live !== 'y' && !isBigadmin) return null;

                      return (
                        <tr key={feature.name}>
                          <td style={{ textAlign: 'center', width: '12%' }}>
                            {renderStatusCell(feature)}
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            {feature.link ? (
                              <a href={`${feature.link}/${siteId}`}>{feature.title}</a>
                            ) : (
                              feature.title
                            )}
                          </td>
                          <td>{feature.type.replace(/_/g, '\u00a0')}</td>
                          <td>{feature.date_entered}</td>
                          <td>
                            {feature.description}{' '}
                            {feature.info && (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openInfoPopup(feature.name);
                                }}
                              >
                                more...
                              </a>
                            )}
                          </td>
                          <td>{formatCost(feature)}</td>
                          {isBigadmin && (
                            <>
                              <td>
                                <Link href={`/dashboard/store/features/edit?name=${encodeURIComponent(feature.name)}`}>
                                  Edit
                                </Link>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={liveChecked[feature.name] || false}
                                  onChange={(e) =>
                                    setLiveChecked(prev => ({
                                      ...prev,
                                      [feature.name]: e.target.checked,
                                    }))
                                  }
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={dashboardChecked[feature.name] || false}
                                  onChange={(e) =>
                                    setDashboardChecked(prev => ({
                                      ...prev,
                                      [feature.name]: e.target.checked,
                                    }))
                                  }
                                />
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                    {features.filter(f => f.live === 'y' || isBigadmin).length === 0 && (
                      <tr>
                        <td colSpan={isBigadmin ? 9 : 6} style={{ textAlign: 'center' }}>
                          No features found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || (selectedInstall.length === 0 && !isBigadmin)}
              className="btn btn-primary"
            >
              Submit Upgrade Request
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
