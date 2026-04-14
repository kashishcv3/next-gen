'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

interface BlockItem {
  id: number;
  block_type: string;
  block_value: string;
  reason: string;
  created_at: string | null;
}

export default function StoreBlockListPage() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<BlockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockFilter, setBlockFilter] = useState<'all' | 'ip' | 'useragent' | 'store'>('all');
  const [newBlockType, setNewBlockType] = useState('ip');
  const [newBlockValue, setNewBlockValue] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/stores/block-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlocks(response.data.blocks);
        setFilteredBlocks(response.data.blocks);
      } catch (err) {
        setError('Failed to load block list');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (filter: 'all' | 'ip' | 'useragent' | 'store') => {
    setBlockFilter(filter);
    if (filter === 'all') {
      setFilteredBlocks(blocks);
    } else {
      setFilteredBlocks(blocks.filter((b) => b.block_type === filter));
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockValue.trim()) {
      setError('Please enter a block value');
      return;
    }

    setAdding(true);
    setAddSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/stores/block-list/add`,
        {
          block_type: newBlockType,
          block_value: newBlockValue,
          reason: newBlockReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newBlock = response.data.block;
      const updatedBlocks = [newBlock, ...blocks];
      setBlocks(updatedBlocks);

      if (blockFilter === 'all') {
        setFilteredBlocks(updatedBlocks);
      } else {
        setFilteredBlocks(
          updatedBlocks.filter((b) => b.block_type === blockFilter)
        );
      }

      setNewBlockValue('');
      setNewBlockReason('');
      setAddSuccess('Block added successfully');
    } catch (err) {
      setError('Failed to add block');
    } finally {
      setAdding(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h1>Block List - IPs and User Agents</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {addSuccess && <div className="alert alert-success">{addSuccess}</div>}

      <div className="row" style={{ marginBottom: '30px' }}>
        <div className="col-md-6">
          <h3>Add New Block</h3>
          <form onSubmit={handleAddBlock}>
            <div className="form-group">
              <label htmlFor="blockType">Type</label>
              <select
                id="blockType"
                className="form-control"
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value)}
              >
                <option value="ip">IP Address</option>
                <option value="useragent">User Agent</option>
                <option value="store">Store</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="blockValue">Block Value</label>
              <input
                id="blockValue"
                type="text"
                className="form-control"
                value={newBlockValue}
                onChange={(e) => setNewBlockValue(e.target.value)}
                placeholder={
                  newBlockType === 'ip'
                    ? 'Enter IP address'
                    : newBlockType === 'useragent'
                    ? 'Enter user agent string'
                    : 'Enter store identifier'
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="blockReason">Reason</label>
              <input
                id="blockReason"
                type="text"
                className="form-control"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="Why is this being blocked?"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add Block'}
            </button>
          </form>
        </div>
      </div>

      <h3>Current Blocks</h3>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>Filter:</label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            name="blockFilter"
            value="all"
            checked={blockFilter === 'all'}
            onChange={() => handleFilterChange('all')}
          />
          All
        </label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            name="blockFilter"
            value="ip"
            checked={blockFilter === 'ip'}
            onChange={() => handleFilterChange('ip')}
          />
          IP Address
        </label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            name="blockFilter"
            value="useragent"
            checked={blockFilter === 'useragent'}
            onChange={() => handleFilterChange('useragent')}
          />
          User Agent
        </label>
        <label>
          <input
            type="radio"
            name="blockFilter"
            value="store"
            checked={blockFilter === 'store'}
            onChange={() => handleFilterChange('store')}
          />
          Store
        </label>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Value</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No blocks found
                </td>
              </tr>
            ) : (
              filteredBlocks.map((block) => (
                <tr key={block.id}>
                  <td>{block.id}</td>
                  <td>
                    <span className="label label-info">{block.block_type}</span>
                  </td>
                  <td>
                    <code>{block.block_value}</code>
                  </td>
                  <td>{block.reason}</td>
                  <td>{formatDate(block.created_at)}</td>
                  <td>
                    <button className="btn btn-xs btn-danger">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
