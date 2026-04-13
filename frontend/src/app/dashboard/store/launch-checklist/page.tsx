'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ChecklistItem {
  id: string;
  name: string;
  week: number;
  parent_id?: string;
  category: string;
  checked: boolean;
  checked_by?: string;
  date_completed?: string;
  task?: string;
}

interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export default function LaunchChecklistPage() {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [userType, setUserType] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChecklist();
    fetchUserType();
  }, []);

  const fetchChecklist = async () => {
    try {
      const res = await api.get('/store/launch-checklist');
      setCategories(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserType = async () => {
    try {
      const res = await api.get('/user/type');
      setUserType(res.data.data?.type || 'user');
    } catch (err) {
      // Keep default user type
    }
  };

  const handleCheckItem = async (itemId: string, currentState: boolean) => {
    try {
      await api.post(`/store/launch-checklist/${itemId}/check`, {
        checked: !currentState,
      });
      fetchChecklist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/store/launch-checklist/${itemId}`);
      fetchChecklist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleAddCategory = async (categoryName: string) => {
    try {
      await api.post('/store/launch-checklist/category', {
        name: categoryName,
      });
      fetchChecklist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleAddItem = async (categoryId: string, itemName: string, parentId?: string) => {
    try {
      await api.post('/store/launch-checklist/item', {
        category_id: categoryId,
        name: itemName,
        parent_id: parentId,
      });
      fetchChecklist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, any> = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      await api.post('/store/launch-checklist/update', data);
      fetchChecklist();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update checklist');
    } finally {
      setSubmitting(false);
    }
  };

  const isBigAdmin = userType === 'bigadmin' || userType === 'bigadmin_limit';

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Launch Checklist</h1>
          <p>
            <i className="fa fa-info-circle"></i> Checking an item below will notify our support team that it has been checked.
          </p>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <p>
            <i className="fa fa-check text-danger"></i> These items have not been checked<br />
            <i className="fa fa-check text-success"></i> These items been checked and support was notified
          </p>
        </div>
      </div>
      <br />

      {isBigAdmin && (
        <div className="row">
          <div className="col-lg-12">
            <div className={`alert ${editMode ? 'alert-warning' : 'alert-info'}`}>
              <strong>Note</strong> Edit mode is {editMode ? 'turned on' : 'disabled'}. You can
              <a href="#" onClick={(e) => { e.preventDefault(); setEditMode(!editMode); }>
                {editMode ? ' disable' : ' enable'} edit mode
              </a>.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="action" value="StoreChecklist" />
          <div className="row">
            <div className="col-lg-12">
              <div className="well well-cv3-table">
                <div className="table-responsive">
                  <table className="table table-hover table-striped cv3-data-table">
                    <thead>
                      <tr>
                        <th width="55" className="text-center">Week</th>
                        <th className="text-center">Description</th>
                        <th width="120" className="text-center">Date Completed</th>
                        <th width="90" className="text-center">Completed By</th>
                        <th width="75" className="text-center">Task #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <React.Fragment key={category.id}>
                          <tr className="checklistCategoryHeader">
                            <td className="checklistBlue">&nbsp;</td>
                            <td className="checklistCategory checklistLefted checklistBlue">
                              <strong>{category.name}</strong>
                              {isBigAdmin && editMode && (
                                <span className="pull-right">
                                  <i
                                    className="fa fa-pencil"
                                    style={{ cursor: 'pointer', color: '#4682B4' }}
                                  ></i>
                                  <i
                                    className="fa fa-trash-o"
                                    style={{ cursor: 'pointer', color: '#FF0000', marginLeft: '10px' }}
                                  ></i>
                                </span>
                              )}
                            </td>
                            <td className="checklistBlue" colSpan={2}>&nbsp;</td>
                            <td className="checklistBlue checklistCentered">
                              {isBigAdmin && editMode && (
                                <button type="submit" className="btn btn-primary btn-sm">
                                  Submit
                                </button>
                              )}
                            </td>
                          </tr>

                          {category.items.map(item => (
                            <tr key={item.id}>
                              <td className="checklistColumn checklistCentered">{item.week}</td>
                              <td className="checklistColumn checklistItem checklistLefted checklistLeftBorder">
                                {item.checked ? (
                                  <i
                                    className="fa fa-check text-success"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCheckItem(item.id, true)}
                                  ></i>
                                ) : (
                                  <i
                                    className="fa fa-check text-danger"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleCheckItem(item.id, false)}
                                  ></i>
                                )}
                                {' '}{item.name}
                                {isBigAdmin && editMode && (
                                  <span className="pull-right">
                                    <i
                                      className="fa fa-pencil"
                                      style={{ cursor: 'pointer', color: '#4682B4' }}
                                    ></i>
                                    <i
                                      className="fa fa-trash-o"
                                      style={{ cursor: 'pointer', color: '#FF0000', marginLeft: '10px' }}
                                      onClick={() => handleDeleteItem(item.id)}
                                    ></i>
                                  </span>
                                )}
                              </td>
                              <td className="checklistColumn checklistCentered checklistLeftBorder">
                                {item.date_completed ? new Date(item.date_completed).toLocaleDateString() : ''}
                              </td>
                              <td className="checklistColumn checklistCentered checklistLeftBorder">
                                {item.checked_by || ''}
                              </td>
                              <td className="checklistColumn checklistCentered checklistLeftBorder">
                                {editMode && isBigAdmin ? (
                                  <input
                                    type="text"
                                    className="form-control form-control-inline"
                                    defaultValue={item.task || ''}
                                    name={`task_${item.id}`}
                                    size={5}
                                    maxLength={6}
                                    style={{ textAlign: 'center' }}
                                  />
                                ) : (
                                  item.task || ''
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}

                      {isBigAdmin && editMode && (
                        <tr>
                          <td>
                            <input type="text" className="form-control form-control-inline" size={5} />
                          </td>
                          <td className="checklistColumn checklistLefted checklistLeftBorder">
                            <i className="fa fa-plus-circle" style={{ color: '#008000', cursor: 'pointer' }}></i>
                            {' '}Add new category...
                          </td>
                          <td colSpan={3}>&nbsp;</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {isBigAdmin && editMode && (
            <div className="row">
              <div className="col-lg-12">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Submit Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
