'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

/**
 * Domain Name Management page.
 * Replicates old platform's store_domain.tpl exactly.
 * Panel with: Edit Current Domain, Edit Secure Domain, CDN Domain (display).
 * On submit: updates domain, shows finish page with link.
 */

export default function StoreDomainPage() {
  const { siteId } = useStore();

  const [domain, setDomain] = useState('');
  const [secureDomain, setSecureDomain] = useState('');
  const [cdnBucket, setCdnBucket] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (siteId) fetchDomain();
  }, [siteId]);

  const fetchDomain = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/store-domain/domain/${siteId}`);
      setDomain(res.data.domain || '');
      setSecureDomain(res.data.secure_domain || '');
      setCdnBucket(res.data.cdn_bucket || '');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load domain info');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await api.post(`/store-domain/domain/${siteId}`, {
        domain: domain,
        secure_domain: secureDomain,
      });
      setFinished(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update domain');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-lg-12"><p>Loading...</p></div>
      </div>
    );
  }

  // Finish page (matches store_domain_finish.tpl)
  if (finished) {
    return (
      <>
        <br /><br />
        <div className="row">
          <div className="col-lg-12">
            You can access your store with the following domain after it has been updated by the systems administrator
            {domain ? (
              <>
                &nbsp;&nbsp; -{' '}
                <a href={`http://${domain}`} target="_blank" rel="noreferrer">
                  {domain}
                </a>
                <br />
              </>
            ) : (
              <>
                &nbsp;&nbsp; - You have no domains listed<br />
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <h1>Domain Name Management</h1>
        </div>
      </div>
      <br />
      <p className="help-block">
        Domains should be in the following form:&nbsp;<em>colormaria.com</em>
      </p>
      <p className="text-danger">
        *Do not include a prefix (such as www). All prefixes will be forwarded to your store.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleSubmit}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Domain Name Management</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Edit Current Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    name="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    size={50}
                  />
                </div>
                <div className="form-group">
                  <label>Edit Secure Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    name="secure_domain"
                    value={secureDomain}
                    onChange={(e) => setSecureDomain(e.target.value)}
                    size={50}
                  />
                </div>
                <div className="form-group">
                  <label>CDN Domain</label>
                  <div>{cdnBucket || 'none'}</div>
                </div>
              </div>
            </div>
            <input
              type="submit"
              name="submit"
              value={saving ? 'Saving...' : 'Submit'}
              className="btn btn-primary"
              disabled={saving}
            />
          </form>
        </div>
      </div>
    </>
  );
}
