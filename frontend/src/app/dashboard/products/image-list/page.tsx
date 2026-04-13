'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ProductImage {
  id: string;
  product_name: string;
  image_url: string;
  alt_text: string;
  position: number;
}

export default function ProductImageListPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/images');
      setImages(response.data.data || []);
    } catch (err) {
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/products/images/${imageId}`);
      setImages(images.filter(img => img.id !== imageId));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Product Images</h1>
          <p><i className="fa fa-image"></i> Manage product images.</p>
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Images ({images.length})</h3>
              </div>
              <div className="panel-body">
                {images.length === 0 ? (
                  <p className="text-muted">No images found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Image</th>
                        <th>Alt Text</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {images.map(img => (
                        <tr key={img.id}>
                          <td>{img.product_name}</td>
                          <td>
                            <img
                              src={img.image_url}
                              alt={img.alt_text}
                              style={{ maxWidth: '100px', maxHeight: '100px' }}
                            />
                          </td>
                          <td>{img.alt_text}</td>
                          <td>{img.position}</td>
                          <td>
                            <button
                              onClick={() => handleDelete(img.id)}
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
