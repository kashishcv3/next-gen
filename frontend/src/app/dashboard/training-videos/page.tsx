'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface VideoInfo {
  id: number;
  class_title: string;
  class_description: string;
  video_url: string;
}

export default function TrainingVideosPage() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add/Edit form state
  const [selectedId, setSelectedId] = useState('');
  const [classTitle, setClassTitle] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Delete checkboxes
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin-tools/training-videos');
      setVideos(res.data.videos || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load training videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    if (id === '') {
      setClassTitle('');
      setClassDescription('');
      setVideoUrl('');
    } else {
      const video = videos.find((v) => v.id === parseInt(id));
      if (video) {
        setClassTitle(video.class_title);
        setClassDescription(video.class_description);
        setVideoUrl(video.video_url);
      }
    }
  };

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      await api.post('/admin-tools/training-videos', {
        edit_type: selectedId ? 'edit' : 'add',
        id: selectedId ? parseInt(selectedId) : null,
        class_title: classTitle,
        class_description: classDescription,
        video_url: videoUrl,
      });
      setSuccess(selectedId ? 'Video updated successfully' : 'Video added successfully');
      setSelectedId('');
      setClassTitle('');
      setClassDescription('');
      setVideoUrl('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save video');
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (deleteIds.length === 0) {
      setError('Please select at least one video to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete the selected video(s)?')) return;

    try {
      await api.post('/admin-tools/training-videos/delete', {
        ids: deleteIds,
      });
      setSuccess('Video(s) deleted successfully');
      setDeleteIds([]);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete video(s)');
    }
  };

  const toggleDelete = (id: number) => {
    if (deleteIds.includes(id)) {
      setDeleteIds(deleteIds.filter((i) => i !== id));
    } else {
      setDeleteIds([...deleteIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Training Videos</h1>
          <p><i className="fa fa-info-circle"></i> Use this form to add or edit the Training Videos that appear on the &quot;Training Videos&quot; page under the &quot;Help&quot; menu.</p>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="row">
        <div className="col-lg-12">
          <form onSubmit={handleAddEdit}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Add or Edit Training Videos</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Select Class</label>
                  <select
                    className="form-control"
                    value={selectedId}
                    onChange={(e) => handleSelectChange(e.target.value)}
                  >
                    <option value="">Add a New Class</option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>{v.class_title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Class Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Class Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={classDescription}
                    onChange={(e) => setClassDescription(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="help-block">(e.g., http://blip.tv/play/AdacB43mIQ)</p>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-plus"></i> {selectedId ? 'Update Video' : 'Add Video'}
            </button>
          </form>
        </div>
      </div>

      <br />

      {/* Delete Form */}
      <div className="row">
        <div className="col-lg-12">
          <p><i className="fa fa-info-circle"></i> Use this form to delete the Training Videos that appear on the &quot;Training Videos&quot; page under the &quot;Help&quot; menu.</p>
          <form onSubmit={handleDelete}>
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Delete Training Videos</h3>
              </div>
              <div className="panel-body">
                <table className="table table-striped" style={{ width: '100%' }}>
                  <tbody>
                    {videos.map((v) => (
                      <tr key={v.id}>
                        <td>{v.class_title}</td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="checkbox"
                            checked={deleteIds.includes(v.id)}
                            onChange={() => toggleDelete(v.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-trash"></i> Delete Video(s)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
