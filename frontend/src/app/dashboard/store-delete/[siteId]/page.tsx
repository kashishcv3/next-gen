'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface StoreInfo {
  id: number;
  name: string;
  display_name: string;
  domain: string;
  is_live: string;
}

export default function StoreDeletePage() {
  const params = useParams();
  const router = useRouter();
  const siteId = parseInt(params.siteId as string);

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/stores/delete-info/${siteId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStore(response.data);
      } catch (err) {
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  const handleDelete = async () => {
    if (!confirmed) {
      setError('You must confirm deletion');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/stores/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Redirect to store options after successful deletion
      router.push('/dashboard/store-storeoptions');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete store');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  if (!store) {
    return (
      <div className="container" style={{ marginTop: '20px' }}>
        <div className="alert alert-danger">Store not found</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div className="row">
        <div className="col-md-8">
          <h1>Delete This Store</h1>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="panel panel-danger">
            <div className="panel-heading">
              <h3 className="panel-title">Danger Zone - This Action Cannot Be Undone</h3>
            </div>
            <div className="panel-body">
              <p>
                You are about to delete the store: <strong>{store.name}</strong>
              </p>

              <div className="alert alert-warning">
                <p>
                  <strong>Warning:</strong> Deleting this store will permanently remove all
                  associated data including products, orders, customers, and settings.
                </p>
                <p>This action cannot be reversed.</p>
              </div>

              <div className="well">
                <h4>Store Details:</h4>
                <dl className="dl-horizontal">
                  <dt>Name</dt>
                  <dd>{store.name}</dd>
                  <dt>Display Name</dt>
                  <dd>{store.display_name}</dd>
                  <dt>Domain</dt>
                  <dd>{store.domain}</dd>
                  <dt>Status</dt>
                  <dd>
                    <span
                      className={`label ${
                        store.is_live === 'y' ? 'label-danger' : 'label-default'
                      }`}
                    >
                      {store.is_live === 'y' ? 'Live' : 'Offline'}
                    </span>
                  </dd>
                </dl>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    I understand this will permanently delete {store.name} and all its data
                  </label>
                </div>

                <div className="form-group">
                  <a href="/dashboard/store-storeoptions" className="btn btn-default">
                    Cancel
                  </a>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={!confirmed || deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Store'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
