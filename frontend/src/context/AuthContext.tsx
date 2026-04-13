'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginRequest, LoginResponse, MFAVerifyRequest } from '@/types';
import * as authLib from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  verifyMFA: (req: MFAVerifyRequest) => Promise<LoginResponse>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from cookies on mount
  useEffect(() => {
    const token = authLib.getToken();
    const user = authLib.getUser();

    if (token && user) {
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const handleLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await authLib.login(credentials);

      if (!result.mfa_required) {
        setState({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const handleVerifyMFA = async (req: MFAVerifyRequest): Promise<LoginResponse> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await authLib.verifyMFA(req);
      setState({
        user: result.user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'MFA verification failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const handleLogout = () => {
    authLib.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshUser = () => {
    const token = authLib.getToken();
    const user = authLib.getUser();

    if (token && user) {
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: handleLogin,
        verifyMFA: handleVerifyMFA,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
