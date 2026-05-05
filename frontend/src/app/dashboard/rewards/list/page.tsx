'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface RewardsConfig {
  site_id: number;
  spent_points: number;
  spent_amount: number;
  prod_points: number;
  prod_amount: number;
  skip_payment_methods: string[];
}

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Bank Transfer',
  'Wire Transfer',
  'Check',
  'Money Order',
  'Gift Card',
];

export default function RewardsListPage() {
  const [config, setConfig] = useState<RewardsConfig>({
    site_id: 93,
    spent_points: 0,
    spent_amount: 0,
    prod_points: 0,
    prod_amount: 0,
    skip_payment_methods: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRewardsConfig();
  }, []);

  const fetchRewardsConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/customers/rewards', {
        params: { site_id: 93 },
      });
      if (res.data.data) {
        setConfig(res.data.data);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to load rewards configuration';
      setError(errorMsg);
      console.error('Error fetching rewards config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setConfig(prev => ({
      ...prev,
      skip_payment_methods: prev.skip_payment_methods.includes(method)
        ? prev.skip_payment_methods.filter(m => m !== method)
        : [...prev.skip_payment_methods, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payloadConfig = {
        spent_points: config.spent_points,
        spent_amount: config.spent_amount,
        prod_points: config.prod_points,
        prod_amount: config.prod_amount,
        skip_payment_methods: config.skip_payment_methods,
      };

      await api.post('/customers/rewards', payloadConfig, {
        params: { site_id: 93 },
      });

      setSuccess('Rewards configuration saved successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save rewards configuration';
      setError(errorMsg);
      console.error('Error saving rewards config:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>
            <i
              className="fa fa-gift"
              style={{ color: '#f0ad4e', marginRight: '8px' }}
            ></i>
            Rewards Program
          </h1>
          <p className="text-muted">
            Configure your customer rewards points program settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="row" style={{ marginBottom: '15px' }}>
          <div className="col-lg-8">
            <div className="alert alert-danger alert-dismissible">
              <button
                type="button"
                className="close"
                onClick={() => setError(null)}
              >
                <span>&times;</span>
              </button>
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="row" style={{ marginBottom: '15px' }}>
          <div className="col-lg-8">
            <div className="alert alert-success alert-dismissible">
              <button
                type="button"
                className="close"
                onClick={() => setSuccess(null)}
              >
                <span>&times;</span>
              </button>
              <i className="fa fa-check-circle"></i> {success}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="row">
          <div className="col-lg-8">
            <div
              className="text-center"
              style={{ padding: '40px', color: '#999' }}
            >
              <i className="fa fa-spinner fa-spin fa-2x"></i>
              <p style={{ marginTop: '10px' }}>
                Loading rewards configuration...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <i
                      className="fa fa-star"
                      style={{ marginRight: '8px' }}
                    ></i>
                    Earn Rewards Points
                  </h3>
                </div>
                <div className="panel-body">
                  {/* Points Conversion Section */}
                  <div className="form-group">
                    <label htmlFor="spent_points">
                      <strong>Points Conversion</strong>
                    </label>
                    <div style={{ marginBottom: '10px', color: '#666' }}>
                      <small>
                        For every{' '}
                        <input
                          type="number"
                          id="spent_points"
                          name="spent_points"
                          className="form-control"
                          value={config.spent_points}
                          onChange={handleInputChange}
                          style={{
                            display: 'inline-block',
                            width: '80px',
                            marginLeft: '5px',
                            marginRight: '5px',
                          }}
                          min="0"
                          step="1"
                        />
                        points earned, the customer will receive $
                        <input
                          type="number"
                          id="spent_amount"
                          name="spent_amount"
                          className="form-control"
                          value={config.spent_amount}
                          onChange={handleInputChange}
                          style={{
                            display: 'inline-block',
                            width: '80px',
                            marginLeft: '5px',
                            marginRight: '5px',
                          }}
                          min="0"
                          step="0.01"
                        />
                        off their order.
                      </small>
                    </div>
                  </div>

                  <hr />

                  {/* Product Points Earning Section */}
                  <div className="form-group">
                    <label>
                      <strong>Points Earning Per Purchase</strong>
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod_points">Product Points</label>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                      For each product purchase, the customer earns this many
                      points.
                    </p>
                    <input
                      type="number"
                      id="prod_points"
                      name="prod_points"
                      className="form-control"
                      value={config.prod_points}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prod_amount">Points Per Dollar Spent</label>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                      For each dollar spent, the customer earns this many
                      points.
                    </p>
                    <input
                      type="number"
                      id="prod_amount"
                      name="prod_amount"
                      className="form-control"
                      value={config.prod_amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <hr />

                  {/* Skip Payment Methods */}
                  <div className="form-group">
                    <label>
                      <strong>Skip Payment Methods</strong>
                    </label>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                      Select payment methods to exclude from earning rewards
                      points.
                    </p>
                    <div style={{ marginTop: '10px' }}>
                      {PAYMENT_METHODS.map(method => (
                        <div key={method} style={{ marginBottom: '8px' }}>
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: 0,
                              cursor: 'pointer',
                              fontWeight: 'normal',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={config.skip_payment_methods.includes(
                                method
                              )}
                              onChange={() =>
                                handlePaymentMethodToggle(method)
                              }
                              style={{ marginRight: '8px' }}
                            />
                            {method}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting || loading}
                  style={{ marginRight: '10px' }}
                >
                  <i
                    className="fa fa-save"
                    style={{ marginRight: '6px' }}
                  ></i>
                  {submitting ? 'Saving...' : 'Save Configuration'}
                </button>
                <button
                  type="button"
                  className="btn btn-default btn-lg"
                  onClick={fetchRewardsConfig}
                  disabled={submitting || loading}
                >
                  <i
                    className="fa fa-refresh"
                    style={{ marginRight: '6px' }}
                  ></i>
                  Reload
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="col-lg-4">
              <div className="panel panel-info">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <i
                      className="fa fa-info-circle"
                      style={{ marginRight: '6px' }}
                    ></i>
                    Configuration Guide
                  </h3>
                </div>
                <div className="panel-body" style={{ fontSize: '12px' }}>
                  <h5>
                    <strong>How Rewards Work</strong>
                  </h5>
                  <p>
                    Your rewards program has two earning mechanisms:
                  </p>
                  <ol style={{ marginBottom: '15px' }}>
                    <li>
                      <strong>Points to Discount:</strong> Customers accumulate
                      points and redeem them for discounts. For example, 100
                      points = $5 off.
                    </li>
                    <li>
                      <strong>Point Earning:</strong> Customers earn points when
                      making purchases. You can offer points per product or per
                      dollar spent.
                    </li>
                  </ol>

                  <h5>
                    <strong>Example Configuration</strong>
                  </h5>
                  <ul style={{ marginBottom: '15px' }}>
                    <li>Points: 100, Amount: 5</li>
                    <li>Prod Points: 1, Prod Amount: 1</li>
                  </ul>
                  <p style={{ color: '#666', marginBottom: '10px' }}>
                    In this case: 100 points earned = $5 discount. Customers
                    earn 1 point per product or 1 point per dollar spent.
                  </p>

                  <h5>
                    <strong>Payment Methods</strong>
                  </h5>
                  <p>
                    Use this section to exclude certain payment methods from
                    earning rewards points. For example, you might not want
                    customers to earn rewards when paying with gift cards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
