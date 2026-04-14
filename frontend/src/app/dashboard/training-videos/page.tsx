'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TrainingVideo {
  id?: number;
  class_name: string;
  title: string;
  description: string;
  url: string;
  sort_order?: number;
  [key: string]: any;
}

export default function TrainingVideosPage() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<TrainingVideo>>({
    class_name: '',
    title: '',
    description: '',
    url: '',
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-tools/training-videos');
      setVideos(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load training videos:', err);
      setError('Failed to load training videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVideo = async () => {
    if (!formData.class_name || !formData.title || !formData.url) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // In a real implementation, this would POST to a backend endpoint
      const newVideo: TrainingVideo = {
        id: Math.max(...videos.map((v) => v.id || 0), 0) + 1,
        class_name: formData.class_name || '',
        title: formData.title || '',
        description: formData.description || '',
        url: formData.url || '',
        sort_order: formData.sort_order || videos.length + 1,
      };

      setVideos((prev) => [...prev, newVideo].sort((a, b) => (a.class_name || '').localeCompare(b.class_name || '')));
      setFormData({ class_name: '', title: '', description: '', url: '' });
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      console.error('Failed to add video:', err);
      setError('Failed to add training video');
    }
  };

  const handleEditVideo = (video: TrainingVideo) => {
    setEditingVideo(video);
    setFormData(video);
    setShowAddForm(true);
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo || !editingVideo.id) return;

    if (!formData.class_name || !formData.title || !formData.url) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // In a real implementation, this would PUT to a backend endpoint
      setVideos((prev) =>
        prev
          .map((v) => (v.id === editingVideo.id ? { ...v, ...formData } : v))
          .sort((a, b) => (a.class_name || '').localeCompare(b.class_name || ''))
      );
      setFormData({ class_name: '', title: '', description: '', url: '' });
      setEditingVideo(null);
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update video:', err);
      setError('Failed to update training video');
    }
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingVideo(null);
    setFormData({ class_name: '', title: '', description: '', url: '' });
    setError(null);
  };

  const handleSelectForDelete = (id: number | undefined, checked: boolean) => {
    if (!id) return;
    setSelectedForDelete((prev) =>
      checked ? [...prev, id] : prev.filter((vid) => vid !== id)
    );
  };

  const handleDeleteVideos = async () => {
    if (selectedForDelete.length === 0) {
      setError('Please select at least one video to delete');
      return;
    }

    try {
      // In a real implementation, this would DELETE from a backend endpoint
      setVideos((prev) =>
        prev.filter((v) => !selectedForDelete.includes(v.id || -1))
      );
      setSelectedForDelete([]);
      setShowDeleteForm(false);
      setError(null);
    } catch (err) {
      console.error('Failed to delete videos:', err);
      setError('Failed to delete training videos');
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-md-12">
          <h1>Training Videos</h1>
        </div>
      </div>

      {error && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-12">
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col-md-12">
            <div className="alert alert-info" role="alert">
              Loading training videos...
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Action Buttons */}
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col-md-12">
              <button
                className="btn btn-success"
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
              >
                <i className="fa fa-plus"></i> Add New Video
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteForm(true)}
                disabled={videos.length === 0 || showDeleteForm}
                style={{ marginLeft: '5px' }}
              >
                <i className="fa fa-trash"></i> Delete Videos
              </button>
              <button
                className="btn btn-default"
                onClick={loadVideos}
                style={{ marginLeft: '5px' }}
              >
                <i className="fa fa-refresh"></i> Refresh
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="row" style={{ marginTop: '20px' }}>
              <div className="col-md-8">
                <div className="panel panel-primary">
                  <div className="panel-heading">
                    <h3 className="panel-title">
                      {editingVideo ? 'Edit Training Video' : 'Add New Training Video'}
                    </h3>
                  </div>
                  <div className="panel-body">
                    <div className="form-group">
                      <label htmlFor="class_name" className="control-label">
                        Class Name <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="class_name"
                        name="class_name"
                        value={formData.class_name || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Getting Started, Advanced Topics"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="title" className="control-label">
                        Video Title <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        placeholder="Enter video title"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description" className="control-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        placeholder="Enter video description"
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label htmlFor="url" className="control-label">
                        Video URL <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="url"
                        name="url"
                        value={formData.url || ''}
                        onChange={handleInputChange}
                        placeholder="https://example.com/video"
                      />
                    </div>

                    <div style={{ marginTop: '15px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={editingVideo ? handleUpdateVideo : handleAddVideo}
                      >
                        <i className="fa fa-save"></i> {editingVideo ? 'Update Video' : 'Add Video'}
                      </button>
                      <button
                        className="btn btn-default"
                        onClick={handleCancelForm}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-times"></i> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Form */}
          {showDeleteForm && videos.length > 0 && (
            <div className="row" style={{ marginTop: '20px' }}>
              <div className="col-md-8">
                <div className="panel panel-danger">
                  <div className="panel-heading">
                    <h3 className="panel-title">Delete Training Videos</h3>
                  </div>
                  <div className="panel-body">
                    <p>Select videos to delete:</p>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {videos.map((video) => (
                        <div key={video.id} className="checkbox">
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedForDelete.includes(video.id || -1)}
                              onChange={(e) =>
                                handleSelectForDelete(video.id, e.target.checked)
                              }
                            />
                            <strong>{video.title}</strong> ({video.class_name})
                          </label>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '15px' }}>
                      <button
                        className="btn btn-danger"
                        onClick={handleDeleteVideos}
                        disabled={selectedForDelete.length === 0}
                      >
                        <i className="fa fa-trash"></i> Delete Selected ({selectedForDelete.length})
                      </button>
                      <button
                        className="btn btn-default"
                        onClick={() => {
                          setShowDeleteForm(false);
                          setSelectedForDelete([]);
                        }}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-times"></i> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Videos Table */}
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col-md-12">
              {videos.length === 0 ? (
                <div className="panel panel-info">
                  <div className="panel-heading">
                    <h3 className="panel-title">No Training Videos</h3>
                  </div>
                  <div className="panel-body">
                    <p>No training videos available. Click "Add New Video" to create one.</p>
                  </div>
                </div>
              ) : (
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h3 className="panel-title">Training Videos ({videos.length})</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>Class</th>
                          <th style={{ width: '20%' }}>Title</th>
                          <th style={{ width: '30%' }}>Description</th>
                          <th style={{ width: '20%' }}>URL</th>
                          <th style={{ width: '10%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.map((video) => (
                          <tr key={video.id}>
                            <td>
                              <span className="label label-default">{video.class_name}</span>
                            </td>
                            <td>
                              <strong>{video.title}</strong>
                            </td>
                            <td>{video.description}</td>
                            <td>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted"
                              >
                                <i className="fa fa-external-link"></i> View
                              </a>
                            </td>
                            <td>
                              <button
                                className="btn btn-xs btn-info"
                                onClick={() => handleEditVideo(video)}
                              >
                                <i className="fa fa-edit"></i> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
