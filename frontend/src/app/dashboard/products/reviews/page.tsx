'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Review {
  id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  title: string;
  status: string;
  created_date: string;
}

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/reviews');
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;

    try {
      await api.delete(`/products/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Reviews</h1>
          <p><i className="fa fa-star"></i> Manage customer product reviews.</p>
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
          <Link href="/products/reviews/search" className="btn btn-default">
            <i className="fa fa-search"></i> Search
          </Link>
          <Link href="/products/reviews/settings" className="btn btn-default">
            <i className="fa fa-cog"></i> Settings
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading reviews...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Reviews ({reviews.length})</h3>
              </div>
              <div className="panel-body">
                {reviews.length === 0 ? (
                  <p className="text-muted">No reviews found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(review => (
                        <tr key={review.id}>
                          <td>{review.product_name}</td>
                          <td>{review.customer_name}</td>
                          <td>
                            <span className="badge">{review.rating} / 5</span>
                          </td>
                          <td>{review.title}</td>
                          <td>
                            <span className={`badge ${review.status === 'approved' ? 'badge-success' : ''}`}>
                              {review.status}
                            </span>
                          </td>
                          <td>{review.created_date}</td>
                          <td>
                            <Link href={`/products/reviews/edit/${review.id}`} className="btn btn-sm btn-default">
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="btn btn-sm btn-danger"
                            >
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
