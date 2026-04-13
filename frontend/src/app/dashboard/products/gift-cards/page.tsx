'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface GiftCard {
  id: string;
  code: string;
  balance: string;
  status: string;
  created_date: string;
}

export default function ProductGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/gift-cards');
      setGiftCards(response.data.data || []);
    } catch (err) {
      setError('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Gift Cards</h1>
          <p><i className="fa fa-credit-card"></i> Manage gift cards.</p>
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
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Gift Cards ({giftCards.length})</h3>
              </div>
              <div className="panel-body">
                {giftCards.length === 0 ? (
                  <p className="text-muted">No gift cards found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {giftCards.map(card => (
                        <tr key={card.id}>
                          <td>{card.code}</td>
                          <td>${parseFloat(card.balance).toFixed(2)}</td>
                          <td><span className="badge">{card.status}</span></td>
                          <td>{card.created_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
