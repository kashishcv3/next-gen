'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

/**
 * Feature Upgrade Confirmation page.
 * Replicates old platform's store_features_confirm.tpl exactly.
 */
export default function StoreFeaturesConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { siteId } = useStore();
  const namesParam = searchParams.get('names') || '';

  const [features, setFeatures] = useState<Record<string, any>>({});
  const [currentFeatures, setCurrentFeatures] = useState<Record<string, string>>({});
  const [installNames, setInstallNames] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (namesParam && siteId) {
      const names = namesParam.split(',').filter(Boolean);
      setInstallNames(names);
      fetchConfirmData(names);
    } else {
      setLoading(false);
    }
  }, [namesParam, siteId]);

  const fetchConfirmData = async (names: string[]) => {
    try {
      const res = await api.get(`/store-features/confirm-data/${siteId}`, {
        params: { names: names.join(',') },
      });
      setFeatures(res.data.features || {});
      setCurrentFeatures(res.data.current_features || {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load confirmation data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/store-features/request-upgrade/${siteId}`, {
        install: installNames,
        email: email,
      });
      setSuccess(true);
      // Redirect back to features list after a short delay
      setTimeout(() => {
        router.push('/dashboard/store/features');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit upgrade request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="alert alert-success">
            <i className="fa fa-check"></i> Your upgrade request has been submitted successfully.
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>New Feature Template Upgrade Request</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleConfirm}>
        <div className="row">
          <div className="col-lg-12">
            <div>Please confirm your template upgrade request for the following feature(s).</div>
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th>Requested Upgrades</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installNames.map((name, idx) => {
                      const feat = features[name];
                      if (!feat) return null;

                      return (
                        <React.Fragment key={name}>
                          <tr>
                            <td>
                              {idx + 1}.&nbsp;{feat.title}
                            </td>
                            <td>QUOTE</td>
                          </tr>
                          {/* Show prerequisites that haven't been completed yet */}
                          {feat.prereqs &&
                            feat.prereqs
                              .filter(
                                (prereq: string) =>
                                  prereq &&
                                  prereq !== '' &&
                                  (!currentFeatures[prereq] ||
                                    parseInt(currentFeatures[prereq]) < 2)
                              )
                              .map((prereq: string) => {
                                const prereqFeat = features[prereq];
                                return (
                                  <tr key={`${name}-prereq-${prereq}`}>
                                    <td style={{ textAlign: 'left' }}>
                                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                      {prereqFeat ? prereqFeat.title : prereq} -{' '}
                                      <i>required for {feat.title}</i>
                                    </td>
                                    <td>&nbsp;</td>
                                  </tr>
                                );
                              })}
                        </React.Fragment>
                      );
                    })}
                    <tr>
                      <td colSpan={2}>
                        Email:{' '}
                        <input
                          type="text"
                          className="form-control form-control-inline"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ display: 'inline-block', width: 'auto', minWidth: '300px' }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p>
                Please be advised that submitting your request authorizes any template upgrades less
                than $300.00 to be completed.
              </p>
              <p>
                If the requested template upgrade is more than $300.00, you will be provided a quote
                and project plan to review and approve prior to the work being completed.
              </p>
              <p>
                Finally, should you decide not to have the work completed by our team once you have
                submitted your request, you will incur a $50.00 quoting fee.
              </p>
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm Upgrade Request'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
