'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  confirm: boolean;
}

export default function StoreDeletePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      confirm: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.confirm) {
      setError('You must confirm the deletion');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/store/delete', {});
      router.push('/store/overview');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Delete Store</h1>
          <p>
            <i className="fa fa-warning"></i> This action is permanent and cannot be undone.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-trash"></i> Delete Store</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-danger">
                  <strong>Warning!</strong> Deleting a store will permanently remove all associated data including products, orders, and configurations. This action cannot be undone.
                </div>

                <div className="form-group">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="confirm"
                        checked={formData.confirm}
                        onChange={handleInputChange}
                      />
                      {' '}I understand that this action will permanently delete the store and all associated data.
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading || !formData.confirm}
            >
              {loading ? 'Deleting...' : 'Delete Store'}
            </button>
            <a href="/store/overview" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
