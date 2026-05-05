'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useStore } from '@/context/StoreContext';

interface PendingMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  active: boolean;
}

interface ApiResponse {
  data: PendingMember[];
}

interface MemberSelection {
  [key: string]: {
    approve: boolean;
    delete: boolean;
  };
}

export default function ApproveMembersPage() {
  const router = useRouter();
  const { siteId } = useStore();

  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selections, setSelections] = useState<MemberSelection>({});

  // Fetch pending members on component mount
  useEffect(() => {
    fetchPendingMembers();
  }, [siteId]);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentSiteId = siteId || 93;
      const response = await api.get<ApiResponse>(
        `/customers/members/pending?site_id=${currentSiteId}`
      );

      const memberList = response.data.data || [];
      setMembers(memberList);

      // Initialize selections object
      const initialSelections: MemberSelection = {};
      memberList.forEach((member) => {
        initialSelections[member.user_id] = { approve: false, delete: false };
      });
      setSelections(initialSelections);
    } catch (err: any) {
      console.error('Failed to fetch pending members:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load pending members. Please try again.'
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (
    userId: string,
    type: 'approve' | 'delete'
  ) => {
    setSelections((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [type]: !prev[userId]?.[type],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Collect approve and delete IDs
    const approveIds: string[] = [];
    const deleteIds: string[] = [];

    Object.entries(selections).forEach(([userId, selection]) => {
      if (selection.approve) approveIds.push(userId);
      if (selection.delete) deleteIds.push(userId);
    });

    // Validate that at least one action was selected
    if (approveIds.length === 0 && deleteIds.length === 0) {
      setError('Please select at least one member to approve or delete.');
      return;
    }

    // Prevent approving and deleting the same member
    const conflicts = approveIds.filter((id) => deleteIds.includes(id));
    if (conflicts.length > 0) {
      setError(
        'Cannot both approve and delete the same member. Please select only one action per member.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const currentSiteId = siteId || 93;
      await api.post(`/customers/members/approve?site_id=${currentSiteId}`, {
        approve_ids: approveIds,
        delete_ids: deleteIds,
      });

      setSuccess(
        `Successfully processed ${approveIds.length + deleteIds.length} member(s).`
      );

      // Refresh the member list
      setTimeout(() => {
        fetchPendingMembers();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to process members:', err);
      setError(
        err.response?.data?.message ||
          'Failed to process members. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchPendingMembers();
  };

  return (
    <div>
      {/* Header */}
      <div className="row">
        <div className="col-lg-12">
          <h1>Approve Members</h1>
        </div>
      </div>
      <br />

      {/* Action Buttons */}
      <div className="row">
        <div className="col-lg-12">
          <Link
            href="/dashboard/customers/members/search"
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            <i className="fa fa-search"></i> Member Search
          </Link>
          <Link href="/dashboard/customers/members/add" className="btn btn-success">
            <i className="fa fa-plus"></i> Add Member
          </Link>
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
              <strong>Error:</strong> {error}
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
              <strong>Success!</strong> {success}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-info">
              <i className="fa fa-spinner fa-spin"></i> Loading pending members...
            </div>
          </div>
        </div>
      )}

      {/* Pending Members Table */}
      {!loading && members.length > 0 && (
        <div className="row">
          <div className="col-lg-12">
            <form onSubmit={handleSubmit}>
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <i className="fa fa-list"></i> Pending Members ({members.length})
                  </h3>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>
                          Approve
                        </th>
                        <th style={{ width: '100px', textAlign: 'center' }}>
                          Delete
                        </th>
                        <th style={{ width: '60px', textAlign: 'center' }}>
                          Edit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.user_id}>
                          <td>
                            {member.first_name} {member.last_name}
                          </td>
                          <td>{member.email}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selections[member.user_id]?.approve || false}
                              onChange={() =>
                                handleCheckboxChange(member.user_id, 'approve')
                              }
                              disabled={submitting}
                              aria-label={`Approve ${member.first_name} ${member.last_name}`}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selections[member.user_id]?.delete || false}
                              onChange={() =>
                                handleCheckboxChange(member.user_id, 'delete')
                              }
                              disabled={submitting}
                              aria-label={`Delete ${member.first_name} ${member.last_name}`}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Link
                              href={`/dashboard/customers/members/edit?id=${member.user_id}`}
                              className="btn btn-xs btn-warning"
                              title="Edit member"
                              data-toggle="tooltip"
                              data-placement="top"
                            >
                              <i className="fa fa-edit"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form Actions */}
                <div className="panel-footer">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || loading}
                    style={{ marginRight: '10px' }}
                  >
                    <i
                      className={`fa ${
                        submitting ? 'fa-spinner fa-spin' : 'fa-check'
                      }`}
                    ></i>
                    {submitting ? ' Processing...' : ' Submit'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={handleRefresh}
                    disabled={submitting || loading}
                  >
                    <i className="fa fa-refresh"></i> Refresh
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Pending Members Message */}
      {!loading && members.length === 0 && !error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-info-circle"></i> Pending Members
                </h3>
              </div>
              <div className="panel-body">
                <p>
                  <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
                  No pending members to approve.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site ID Not Available */}
      {!siteId && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">
              <strong>Error:</strong> No site selected. Please select a site before
              viewing pending members.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
