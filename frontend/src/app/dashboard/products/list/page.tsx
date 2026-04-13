'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  product_count: number;
  children?: Category[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
}

export default function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/categories?include_counts=1');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (cats: Category[], depth: number = 0) => {
    return cats.map(category => (
      <div key={category.id} style={{ marginLeft: `${depth * 20}px` }} className="list-group-item">
        <div className="row">
          <div className="col-md-6">
            <button
              className="btn btn-link"
              onClick={() => toggleCategory(category.id)}
              style={{ marginRight: '10px' }}
            >
              {expandedCategories.has(category.id) ? '▼' : '▶'}
            </button>
            <strong>{category.name}</strong>
          </div>
          <div className="col-md-2 text-center">
            <span className="badge">{category.product_count}</span>
          </div>
          <div className="col-md-4 text-right">
            <Link href={`/categories/edit/${category.id}`} className="btn btn-sm btn-default">
              Edit
            </Link>
            <Link href={`/categories/delete/${category.id}`} className="btn btn-sm btn-danger">
              Delete
            </Link>
          </div>
        </div>
        {expandedCategories.has(category.id) && category.children && category.children.length > 0 && (
          <div>{renderCategoryTree(category.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Products</h1>
          <p>
            <i className="fa fa-info-circle"></i> View and manage your product catalog.
          </p>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-lg-12">
          <Link href="/products/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Product
          </Link>
          <Link href="/products/search" className="btn btn-default">
            <i className="fa fa-search"></i> Search
          </Link>
          <Link href="/products/import" className="btn btn-default">
            <i className="fa fa-upload"></i> Import
          </Link>
          <Link href="/products/export" className="btn btn-default">
            <i className="fa fa-download"></i> Export
          </Link>
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
        <div className="row">
          <div className="col-lg-12">
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Category Tree</h3>
              </div>
              <div className="panel-body">
                <div className="list-group">
                  {renderCategoryTree(categories)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
