'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface BlockItem {
  id: number;
  block: string;
  block_type: string;
  block_user: string;
  date_blocked: string;
  unblock_user: string;
  date_unblocked: string;
  case_num: string;
  comments: string;
  active: string;
}

export default function BlockListPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status: string; type: string }>({ status: 'y', type: 'all' });
  const [unblockIds, setUnblockIds] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, string>>({});

  // Add block form
  const [newBlock, setNewBlock] = useState('');
  const [newBlockType, setNewBlockType] = useState('ip');
  const [newCaseNum, setNewCaseNum] = useState('');
  const [newComments, setNewComments] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/stores/block-list');
      const data = res.data.blocks || [];
      setBlocks(data);
      // Initialize comments state
      const commentsMap: Record<number, string> = {};
      data.forEach((b: BlockItem) => { commentsMap[b.id] = b.comments || ''; });
      setComments(commentsMap);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load block list');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockToggle = (id: number) => {
    if (unblockIds.includes(id)) {
      setUnblockIds(unblockIds.filter((i) => i !== id));
    } else {
      setUnblockIds([...unblockIds, id]);
    }
  };

  const handleSubmitUnblock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (unblockIds.length === 0 && !newBlock) {
      setError('No changes to submit');
      return;
    }

    try {
      if (newBlock) {
        await api.post('/stores/block-list/add', {
          block_value: newBlock,
          block_type: newBlockType,
          case_num: newCaseNum,
          reason: newComments,
        });
      }

      if (unblockIds.length > 0) {
        await api.post('/stores/block-list/unblock', {
          ids: unblockIds,
          comments: unblockIds.reduce((acc, id) => {
            acc[id] = comments[id] || '';
            return acc;
          }, {} as Record<number, string>),
        });
      }

      setSuccess('Block list updated successfully');
      setNewBlock('');
      setNewBlockType('ip');
      setNewCaseNum('');
      setNewComments('');
      setUnblockIds([]);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update block list');
    }
  };

  const getFilteredBlocks = () => {
    return blocks.filter((b) => {
      const statusMatch = b.active === filter.status;
      const typeMatch = filter.type === 'all' || b.block_type === filter.type;
      return statusMatch && typeMatch;
    });
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <p><i className="fa fa-spinner fa-spin"></i> Loading...</p>
      </div>
    );
  }

  const filteredBlocks = getFilteredBlocks();

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Block List</h1>
          <p>
            <i className="fa fa-info-circle"></i> Use this list to block IPs and user agents and maintenance page stores. After a change has been made, it could take several minutes before it comes into effect as it propagates to www.
          </p>
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

      {/* Filter Controls */}
      <div style={{ marginBottom: '15px' }}>
        <div>
          <strong>Show Blocked:</strong>&nbsp;&nbsp;
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'y' && filter.type === 'all'} onChange={() => setFilter({ status: 'y', type: 'all' })} /> All
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'y' && filter.type === 'ip'} onChange={() => setFilter({ status: 'y', type: 'ip' })} /> IP
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'y' && filter.type === 'ua'} onChange={() => setFilter({ status: 'y', type: 'ua' })} /> User Agent
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'y' && filter.type === 'store'} onChange={() => setFilter({ status: 'y', type: 'store' })} /> Store
          </label>
        </div>
        <div style={{ marginTop: '5px' }}>
          <strong>Show Unblocked:</strong>&nbsp;&nbsp;
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'n' && filter.type === 'all'} onChange={() => setFilter({ status: 'n', type: 'all' })} /> All
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'n' && filter.type === 'ip'} onChange={() => setFilter({ status: 'n', type: 'ip' })} /> IP
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'n' && filter.type === 'ua'} onChange={() => setFilter({ status: 'n', type: 'ua' })} /> User Agent
          </label>
          <label className="radio-inline">
            <input type="radio" name="filter" checked={filter.status === 'n' && filter.type === 'store'} onChange={() => setFilter({ status: 'n', type: 'store' })} /> Store
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmitUnblock}>
        <div className="row">
          <div className="col-lg-12">
            <div className="well well-cv3-table">
              <div className="table-responsive">
                <table className="table table-hover table-striped cv3-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Blocked</th>
                      <th>Type</th>
                      <th>Block User</th>
                      <th>Date Blocked</th>
                      <th>Unblock User</th>
                      <th>Date Unblocked</th>
                      <th>FB#</th>
                      <th>Comments</th>
                      {filter.status === 'y' && <th>Unblock</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlocks.length === 0 ? (
                      <tr>
                        <td colSpan={filter.status === 'y' ? 9 : 8} className="text-center">No entries found</td>
                      </tr>
                    ) : (
                      filteredBlocks.map((block) => (
                        <tr key={block.id}>
                          <td>{block.block}</td>
                          <td>{block.block_type}</td>
                          <td>{block.block_user}</td>
                          <td>{block.date_blocked}</td>
                          <td>{block.unblock_user}</td>
                          <td>{block.date_unblocked}</td>
                          <td>
                            {block.case_num && (
                              <a href={`https://cv3.fogbugz.com/default.asp?${block.case_num}`} target="_blank" rel="noopener noreferrer">
                                {block.case_num}
                              </a>
                            )}
                          </td>
                          <td>
                            <textarea
                              className="form-control"
                              rows={3}
                              style={{ width: '200px' }}
                              disabled={!unblockIds.includes(block.id)}
                              value={comments[block.id] || ''}
                              onChange={(e) => setComments({ ...comments, [block.id]: e.target.value })}
                            />
                          </td>
                          {filter.status === 'y' && (
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={unblockIds.includes(block.id)}
                                onChange={() => handleUnblockToggle(block.id)}
                              />
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-check"></i> Submit
            </button>

            {/* Add Block Panel */}
            <div className="panel panel-primary" style={{ marginTop: '20px' }}>
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Add Block</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Block</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '400px' }}
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    style={{ width: '200px' }}
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value)}
                  >
                    <option value="ip">IP</option>
                    <option value="ua">User Agent</option>
                    <option value="store">Store</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>FB Case #</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={newCaseNum}
                    onChange={(e) => setNewCaseNum(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    style={{ width: '400px' }}
                    value={newComments}
                    onChange={(e) => setNewComments(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="fa fa-check"></i> Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
