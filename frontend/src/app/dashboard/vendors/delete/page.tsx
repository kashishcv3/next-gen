'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DeletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemId, setItemId] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    if (!itemId || !confirmed) { setError('Confirm deletion'); return; }
    try {
      setLoading(true);
      await api.delete(`/vendors/${itemId}`);
      router.push('/vendors/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Delete Vendor</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="panel panel-danger">
        <div className="panel-body">
          <div className="alert alert-warning">This cannot be undone.</div>
          <input type="text" className="form-control" placeholder="ID" value={itemId} onChange={e => setItemId(e.target.value)} />
          <div className="checkbox" style={{ marginTop: '10px'}}>
            <label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confirm</label>
          </div>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading || !itemId || !confirmed}>Delete</button>
          <Link href="/vendors/list" className="btn btn-default" style={{ marginLeft: '10px'}}>Cancel</Link>
        </div>
      </div>
    </div>
  );
}
