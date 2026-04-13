'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface QAndA {
  id: string;
  product_name: string;
  question: string;
  answer: string | null;
  status: string;
}

export default function ProductQandaPage() {
  const [items, setItems] = useState<QAndA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQandA();
  }, []);

  const fetchQandA = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/qanda');
      setItems(response.data.data || []);
    } catch (err) {
      setError('Failed to load Q&A');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this Q&A?')) return;
    try {
      await api.delete(`/products/qanda/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Q&A</h1>
          <p><i className="fa fa-question-circle"></i> Manage product questions and answers.</p>
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

      <div className="row">
        <div className="col-lg-12">
          <Link href="/products/qanda/search" className="btn btn-default">
            <i className="fa fa-search"></i> Search
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Q&A Items ({items.length})</h3>
              </div>
              <div className="panel-body">
                {items.length === 0 ? (
                  <p className="text-muted">No Q&A found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.question}</td>
                          <td>{item.answer ? 'Yes' : 'No'}</td>
                          <td><span className="badge">{item.status}</span></td>
                          <td>
                            <Link href={`/products/qanda/edit/${item.id}`} className="btn btn-sm btn-default">
                              Edit
                            </Link>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
