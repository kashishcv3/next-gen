'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Rule {
  rule_id: string;
  rule_name: string;
  effect: string;
  [key: string]: any;
}

interface CustomerGroup {
  cgroup_id: string;
  name: string;
  inactive: number;
}

interface GroupWithRules extends CustomerGroup {
  rules: Rule[];
}

interface ApiResponse {
  data: CustomerGroup[];
  rules: {
    [key: string]: Rule[];
  };
}

interface RowState {
  expanded: boolean;
  inactive: boolean;
  delete: boolean;
}

export default function CustomerGroupsListPage() {
  const [groups, setGroups] = useState<GroupWithRules[]>([]);
  const [rowStates, setRowStates] = useState<{ [key: string]: RowState }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/customers/groups');
      const data = res.data as ApiResponse;

      const groupsArray = data.data || [];
      const rulesMap = data.rules || {};

      const groupsWithRules: GroupWithRules[] = groupsArray.map(group => ({
        ...group,
        rules: rulesMap[group.cgroup_id] || [],
      }));

      setGroups(groupsWithRules);

      // Initialize row states
      const initialStates: { [key: string]: RowState } = {};
      groupsWithRules.forEach(group => {
        initialStates[group.cgroup_id] = {
          expanded: false,
          inactive: group.inactive === 1 || group.inactive === true,
          delete: false,
        };
      });
      setRowStates(initialStates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (groupId: string) => {
    setRowStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        expanded: !prev[groupId].expanded,
      },
    }));
  };

  const toggleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);

    const newStates: { [key: string]: RowState } = {};
    Object.keys(rowStates).forEach(groupId => {
      newStates[groupId] = {
        ...rowStates[groupId],
        expanded: newExpandAll,
      };
    });
    setRowStates(newStates);
  };

  const toggleInactive = (groupId: string) => {
    setRowStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        inactive: !prev[groupId].inactive,
      },
    }));
  };

  const toggleDelete = (groupId: string) => {
    setRowStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        delete: !prev[groupId].delete,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const inactiveIds: string[] = [];
      const activeIds: string[] = [];
      const deleteIds: string[] = [];

      Object.keys(rowStates).forEach(groupId => {
        const state = rowStates[groupId];
        if (state.delete) {
          deleteIds.push(groupId);
        } else if (state.inactive) {
          inactiveIds.push(groupId);
        } else {
          activeIds.push(groupId);
        }
      });

      const payload = {
        inactive_ids: inactiveIds,
        active_ids: activeIds,
        delete_ids: deleteIds,
      };

      await api.post('/customers/groups', payload);
      setSuccess('Changes saved successfully');

      // Refresh data after successful save
      setTimeout(() => {
        fetchGroups();
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
      console.error('Error saving changes:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info" role="alert">
              <i className="fa fa-spinner fa-spin"></i> Loading customer groups...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Customer Groups</h1>
        </div>
      </div>
      <br />

      {/* Error Alert */}
      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success alert-dismissible" role="alert">
              <button
                type="button"
                className="close"
                onClick={() => setSuccess(null)}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <i className="fa fa-check-circle"></i> {success}
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-primary">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="fa fa-list"></i> Customer Groups
              </h3>
            </div>

            <div className="panel-body">
              {/* Expand/Collapse All Buttons */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <button
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={toggleExpandAll}
                >
                  <i className={`fa fa-${expandAll ? 'compress' : 'expand'}`}></i>{' '}
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              {/* Table */}
              <form onSubmit={handleSubmit}>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>Customer Group</th>
                        <th>Rule Name</th>
                        <th>Rule Effect</th>
                        <th>Customer Group ID</th>
                        <th style={{ width: '80px' }}>
                          <span title="Inactive">Inactive</span>
                        </th>
                        <th style={{ width: '80px' }}>
                          <span title="Delete">Delete</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.length > 0 ? (
                        groups.map(group => (
                          <React.Fragment key={group.cgroup_id}>
                            {/* Group Row */}
                            <tr
                              className={
                                rowStates[group.cgroup_id]?.delete
                                  ? 'danger'
                                  : ''
                              }
                            >
                              <td style={{ textAlign: 'center', cursor: 'pointer' }}>
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm"
                                  onClick={() => toggleExpand(group.cgroup_id)}
                                  style={{
                                    padding: '0',
                                    margin: '0',
                                    lineHeight: '1',
                                  }}
                                  title={
                                    rowStates[group.cgroup_id]?.expanded
                                      ? 'Collapse'
                                      : 'Expand'
                                  }
                                >
                                  <i
                                    className={`fa fa-chevron-${
                                      rowStates[group.cgroup_id]?.expanded
                                        ? 'down'
                                        : 'right'
                                    }`}
                                  ></i>
                                </button>
                              </td>
                              <td>
                                <strong>{group.name}</strong>
                              </td>
                              <td></td>
                              <td></td>
                              <td>
                                <code>{group.cgroup_id}</code>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={
                                    rowStates[group.cgroup_id]?.inactive || false
                                  }
                                  onChange={() => toggleInactive(group.cgroup_id)}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={
                                    rowStates[group.cgroup_id]?.delete || false
                                  }
                                  onChange={() => toggleDelete(group.cgroup_id)}
                                />
                              </td>
                            </tr>

                            {/* Expanded Rules Rows */}
                            {rowStates[group.cgroup_id]?.expanded &&
                              group.rules.length > 0 && (
                                <>
                                  {group.rules.map((rule, index) => (
                                    <tr
                                      key={`${group.cgroup_id}-rule-${rule.rule_id}`}
                                      className="info"
                                      style={{ backgroundColor: '#f5f5f5' }}
                                    >
                                      <td colSpan={1}></td>
                                      <td style={{ paddingLeft: '40px' }}>
                                        <em style={{ color: '#666' }}>
                                          {index + 1}.{' '}
                                          {group.rules.length > 1 &&
                                            `Rule ${index + 1}`}
                                        </em>
                                      </td>
                                      <td>{rule.rule_name}</td>
                                      <td>
                                        <span className="label label-info">
                                          {rule.effect}
                                        </span>
                                      </td>
                                      <td>
                                        <code>{rule.rule_id}</code>
                                      </td>
                                      <td colSpan={2}></td>
                                    </tr>
                                  ))}
                                </>
                              )}

                            {/* Expanded (No Rules) Message */}
                            {rowStates[group.cgroup_id]?.expanded &&
                              group.rules.length === 0 && (
                                <tr
                                  style={{ backgroundColor: '#f5f5f5' }}
                                >
                                  <td colSpan={1}></td>
                                  <td colSpan={6} style={{ paddingLeft: '40px' }}>
                                    <em style={{ color: '#999' }}>
                                      No rules defined for this group.
                                    </em>
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center">
                            <em>No customer groups found</em>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Submit Button */}
                {groups.length > 0 && (
                  <div
                    className="form-group"
                    style={{ marginTop: '20px', marginBottom: '0' }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <i className="fa fa-spinner fa-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-save"></i> Submit
                        </>
                      )}
                    </button>
                    <span
                      style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      Changes will be saved when you click Submit.
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
