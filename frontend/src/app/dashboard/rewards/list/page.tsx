'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function RewardsListPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/customers/rewards');
      setRewards(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Rewards Program</h1>
          <p><i className="fa fa-info-circle"></i> Manage customer rewards.</p>
        </div>
      </div>
      <br />

      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}

      <div className="row">
        <div className="col-lg-12">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title"><i className="fa fa-gift"></i> Rewards Settings</h3>
            </div>
            <div className="panel-body">
              <p>Configure rewards program settings and view customer rewards.</p>
            </div>
          </div>
        </div>
      </div>
      <br />

      {!loading && (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-list"></i> Rewards</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr><th>Customer</th><th>Points</th><th>Status</th><th>Last Updated</th></tr>
                  </thead>
                  <tbody>
                    {rewards.length > 0 ? rewards.map(reward => (
                      <tr key={reward.id}>
                        <td>{reward.customer_name}</td>
                        <td>{reward.points}</td>
                        <td><span className="label label-success">{reward.status}</span></td>
                        <td>{new Date(reward.updated_at).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="text-center">No rewards found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>}
    </div>
  );
}
