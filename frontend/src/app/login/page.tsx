'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaMessage, setMfaMessage] = useState('Please confirm your account by entering the authentication code sent to your e-mail.');
  const [trustDevice, setTrustDevice] = useState(false);
  const [forwardRoute, setForwardRoute] = useState<string>('/dashboard'); // forward route state

  const { login, verifyMFA, isAuthenticated } = useAuth();
  const router = useRouter();
  const loginBoxRef = useRef<HTMLInputElement>(null);
  const otcRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated && !showMFA) {
      // Only auto-redirect if not in MFA flow — MFA submit handles its own redirect via forward_route
      router.push(forwardRoute || '/dashboard');
    }
  }, [isAuthenticated, showMFA, forwardRoute, router]);

  useEffect(() => {
    if (loginBoxRef.current) {
      loginBoxRef.current.focus();
    }
  }, []);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await login({ username, password });
      if (result.mfa_required && result.mfa_token) {
        setMfaToken(result.mfa_token);
        setShowMFA(true);
      } else {
        // Use the action_forward route from the backend, fallback to /dashboard
        const route = result.forward_route || '/dashboard';
        setForwardRoute(route);
        router.push(route);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleMFASubmit = async () => {
    setMfaError('');
    setIsLoading(true);
    const code = mfaCode.join('');

    try {
      const result = await verifyMFA({ mfa_token: mfaToken, code, trust_device: trustDevice });
      // Use action_forward route from backend, fall back to stored route or /dashboard
      const redirectTo = result.forward_route || forwardRoute || '/dashboard';
      router.push(redirectTo);
    } catch (err: any) {
      setMfaError(err.message || 'Invalid Code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtcInput = (index: number, value: string) => {
    const newCode = [...mfaCode];
    newCode[index] = value.replace(/\D/g, '');
    setMfaCode(newCode);
    if (value && index < 5) {
      otcRefs.current[index + 1]?.focus();
    }
  };

  const handleOtcPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    // Extract digits only
    const digits = pastedText.replace(/\D/g, '').split('').slice(0, 6);
    if (digits.length > 0) {
      const newCode = [...mfaCode];
      // Fill all 6 inputs starting from the first one
      digits.forEach((d, i) => {
        newCode[i] = d;
      });
      setMfaCode(newCode);
      // Focus the last filled input
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      otcRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleOtcKeyUp = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMFASubmit();
    }
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      otcRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <style jsx global>{`
        body { margin: 0; padding: 0; height: 100%; font-family: 'Source Sans Pro', sans-serif; background: #2f2f2f; }
        html { height: 100%; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:700" rel="stylesheet" />
      <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="/css/login.css" rel="stylesheet" />
      <link href="/css/new_login.css" rel="stylesheet" />

      <img
        id="desktop-bg"
        src="/images/login_background.png"
        alt=""
        style={{
          width: '100%', height: '100%', border: 'none', margin: 'auto',
          position: 'absolute', zIndex: -9999, objectFit: 'cover',
        }}
      />

      <div id="body-wrapper" style={{ width: '100%', height: '100%' }}>
        <div id="spacer" style={{ width: '100%', height: '25%' }}></div>

        <div id="body-left" style={{ marginLeft: '8%' }}>
          <div id="logo_box" style={{ width: '50%' }}>
            <img src="/images/cv3_color_logo.png" alt="CV3" style={{ width: '100%', marginBottom: '20px' }} />
          </div>

          <div style={{ background: 'white', paddingTop: '20px', paddingBottom: '20px', borderRadius: '5%', minWidth: '220px' }}>
            <div style={{ margin: 'auto', textAlign: 'center' }} className="form-group">
              <p className="login-alert" style={{
                fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%', color: '#CF0715',
              }}>
                {error}
              </p>
            </div>

            <div style={{ width: '100%' }}>
              <div style={{ width: '200px', margin: 'auto' }}>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} id="login-form" role="form">
                  <div className="form-group">
                    <input
                      type="text"
                      ref={loginBoxRef}
                      id="login_box"
                      style={{
                        border: '1px solid #C7C7C7', borderRadius: '15px', marginBottom: '10px',
                        fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%',
                      }}
                      className="form-control"
                      placeholder="User Id..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyUp={handleKeyUp}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control"
                      style={{
                        border: '1px solid #C7C7C7', borderRadius: '15px', marginBottom: '10px',
                        fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%',
                      }}
                      autoComplete="off"
                      id="pwd"
                      placeholder="Password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handleKeyUp}
                    />
                  </div>
                  <br />
                  <button
                    type="button"
                    id="login-btn"
                    className="btn btn-gray btn-block"
                    style={{
                      fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%',
                      backgroundColor: '#000678', marginBottom: '10px', color: '#fff',
                      borderRadius: '30px', fontSize: '10px', textTransform: 'none',
                    }}
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    <b>{isLoading ? 'Logging in...' : 'Login'}</b>
                  </button>
                  <p style={{ fontFamily: 'OpenSans', color: '#fff', textAlign: 'center' }}>
                    <a
                      href="/forgot-password"
                      style={{
                        color: '#000678', textAlign: 'center',
                        fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%',
                      }}
                    >
                      <b>&nbsp;Forgot your password?</b>
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div id="body-right" style={{ position: 'relative', width: '49%', float: 'right' }}>
          <div style={{ width: '100%' }}>
            <div id="offer_box" style={{ width: '60%', margin: 'auto' }}>
              <img style={{ width: '100%' }} src="/images/apple_pay-gpay-notice.png" alt="Notice" />
            </div>
          </div>
        </div>

        <div style={{ clear: 'both' }}></div>
        <div id="footer" style={{ bottom: 0, right: '10px', position: 'absolute', fontSize: '14px' }}>
          <div id="copyright" style={{ float: 'right', color: '#FCFCFC' }}>
            <p style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%' }}>
              <b>&copy;{new Date().getFullYear()} CommerceV3, Inc. All Rights Reserved.</b>
            </p>
          </div>
          <div style={{ clear: 'both' }}></div>
          <div id="otherstuff" style={{ float: 'right', color: '#FCFCFC' }}>
            <p style={{ fontFamily: 'OpenSans, sans-serif' }}>
              <a style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%' }} href="mailto:workorders@commercev3.com">
                <i className="fa fa-question-circle" style={{ color: '#3AC2FC' }}></i>
                <b className="foot_link_text" style={{ color: '#FCFCFC' }}> Support</b>
              </a>
              {'  '}
              <a style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%' }} href="http://status.commercev3.com" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-info-circle" style={{ color: '#3AC2FC' }}></i>
                <b className="foot_link_text" style={{ color: '#FCFCFC' }}> Status</b>
              </a>
              {'  '}
              <a style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%' }} href="https://www.commercev3.com/contact" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-bullhorn" style={{ color: '#3AC2FC' }}></i>
                <b className="foot_link_text" style={{ color: '#FCFCFC' }}> Contact Us</b>
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* MFA Modal */}
      {showMFA && (
        <div className="modal fade in" style={{ display: 'block', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="center1 txt-center card-box2 two-step-div" style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%', textAlign: 'center' }}>
                  <img className="my-img" src="/images/mfa-icon.png" alt="MFA" style={{ width: '140px', height: 'auto' }} />
                  <p className="two-title" style={{ fontSize: '22px', fontWeight: 'bold', color: '#3c3c3c', marginTop: '15px' }}>AUTHENTICATE YOUR ACCOUNT</p>
                  <p id="mfa-message" className="two-p" style={{ fontSize: '13px', marginTop: '15px', marginBottom: '30px', color: '#666666' }}>
                    {mfaMessage}
                  </p>

                  {mfaError && (
                    <div className="alert alert-danger">
                      {mfaError}
                    </div>
                  )}

                  <div>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        ref={(el) => { otcRefs.current[i] = el; }}
                        className="not-first"
                        style={{
                          width: '10%', borderColor: 'transparent', background: 'transparent',
                          borderBottom: '1.5px solid #cccccc', textAlign: 'center', fontSize: '20px',
                          marginRight: '10px', marginLeft: '10px', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        }}
                        type="text"
                        maxLength={1}
                        value={mfaCode[i]}
                        onChange={(e) => handleOtcInput(i, e.target.value)}
                        onKeyUp={(e) => handleOtcKeyUp(i, e)}
                        onPaste={handleOtcPaste}
                      />
                    ))}
                  </div>
                  <br /><br />

                  <div className="form-check form-check-inline">
                    <label className="form-check-label" style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, fontSize: '15px', color: '#666666' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={trustDevice}
                        onChange={(e) => setTrustDevice(e.target.checked)}
                      /> Trust this device for 7 days
                    </label>
                  </div>
                  <br />

                  <button
                    id="verify_auth_code"
                    style={{
                      fontFamily: "'Open Sans', sans-serif", fontWeight: 400, letterSpacing: '0%',
                      backgroundColor: '#000678', color: '#fff', borderColor: 'transparent',
                      borderRadius: '7px', padding: '10px 25px', fontSize: '14px', cursor: 'pointer',
                    }}
                    type="button"
                    className="btn btn-primary btn-embossed btn-verify"
                    onClick={handleMFASubmit}
                    disabled={isLoading || mfaCode.join('').length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Authenticate'}
                  </button>

                  <p style={{ marginTop: '10px' }}>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setShowMFA(false); }}
                      style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 400, color: '#000678' }}
                    >
                      Back to Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
