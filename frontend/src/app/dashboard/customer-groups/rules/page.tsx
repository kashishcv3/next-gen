'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: string;
}

export default function GroupRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer-groups/rules');
      setRules(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
      setError('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/customer-groups/rules/${id}`);
        fetchRules();
      } catch (err) {
        console.error('Failed to delete rule:', err);
        setError('Failed to delete rule');
      }
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Customer Group Rules</h1>

      {/* Action Buttons */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/customer-groups/rules" className="btn btn-success">
            <i className="fa fa-plus"></i> Create Rule
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading rules...</div>}

      {!loading && rules.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Rules ({rules.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Condition</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.condition}</td>
                    <td>{rule.action}</td>
                    <td>
                      <span className={`label label-${rule.status === 'active' ? 'success' : 'default'}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && rules.length === 0 && !error && (
        <div className="alert alert-info">No rules found.</div>
      )}
    </div>
  );
}
