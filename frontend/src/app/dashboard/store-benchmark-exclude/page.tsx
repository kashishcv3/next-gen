'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Store {
  id: number;
  name: string;
  is_live: string;
}

export default function StoreBenchmarkExcludePage() {
  const [excluded, setExcluded] = useState<Store[]>([]);
  const [included, setIncluded] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/stores/benchmark-exclude');
        setExcluded(response.data.excluded || []);
        setIncluded(response.data.included || []);
      } catch (err) {
        setError('Failed to load benchmark exclude data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const moveToExcluded = () => {
    const selectedElements = document.querySelectorAll(
      '#includedList option:checked'
    ) as NodeListOf<HTMLOptionElement>;
    const movedStores: Store[] = [];

    selectedElements.forEach((option) => {
      const storeId = parseInt(option.value);
      const store = included.find((s) => s.id === storeId);
      if (store) {
        movedStores.push(store);
      }
    });

    setIncluded(included.filter((s) => !movedStores.some((m) => m.id === s.id)));
    setExcluded([...excluded, ...movedStores].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const moveToIncluded = () => {
    const selectedElements = document.querySelectorAll(
      '#excludedList option:checked'
    ) as NodeListOf<HTMLOptionElement>;
    const movedStores: Store[] = [];

    selectedElements.forEach((option) => {
      const storeId = parseInt(option.value);
      const store = excluded.find((s) => s.id === storeId);
      if (store) {
        movedStores.push(store);
      }
    });

    setExcluded(excluded.filter((s) => !movedStores.some((m) => m.id === s.id)));
    setIncluded([...included, ...movedStores].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);
    setError(null);

    try {
      await api.post(
        '/stores/benchmark-exclude/save',
        {
          excluded_ids: excluded.map((s) => s.id),
        }
      );
      setSubmitSuccess('Benchmark exclusion settings saved');
    } catch (err) {
      setError('Failed to save benchmark exclusion settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Benchmark Exclusion</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row" style={{ marginBottom: '20px' }}>
          <div className="col-md-5">
            <h4>Included Stores</h4>
            <select
              id="includedList"
              multiple
              className="form-control"
              style={{ height: '250px' }}
            >
              {included.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2" style={{ textAlign: 'center', paddingTop: '100px' }}>
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={moveToExcluded}
              style={{ marginBottom: '10px' }}
            >
              &gt;&gt;
            </button>
            <button
              type="button"
              className="btn btn-default btn-block"
              onClick={moveToIncluded}
            >
              &lt;&lt;
            </button>
          </div>

          <div className="col-md-5">
            <h4>Excluded Stores</h4>
            <select
              id="excludedList"
              multiple
              className="form-control"
              style={{ height: '250px' }}
            >
              {excluded.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Exclusions'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
